
const User = require('../Models/User');
const Role = require('../Models/Role');
const Request = require('../Models/Request');


const GetDashboardAnalytics = async (req, res) => {
  try {
    // **1. Fetch Request Insights**
    // Count of requests by each request type
    const requestTypeCounts = await Request.aggregate([
      {
        $group: {
          _id: '$requestType', // Group by the request type
          count: { $sum: 1 }, // Count the number of requests for each type
        },
      },
      {
        $project: {
          requestType: '$_id', // Rename _id to requestType for readability
          count: 1, // Include the count field
          _id: 0, // Exclude the _id field from the output
        },
      },
    ]);

    // Count of requests by status and type
    const requestStatusCounts = await Request.aggregate([
      {
        $group: {
          _id: { status: '$status', requestType: '$requestType' }, // Group by both status and request type
          count: { $sum: 1 }, // Count the number of requests for each combination
        },
      },
      {
        $project: {
          status: '$_id.status', // Extract status from the _id field
          requestType: '$_id.requestType', // Extract requestType from the _id field
          count: 1, // Include the count field
          _id: 0, // Exclude the _id field from the output
        },
      },
    ]);

    // **2. Fetch Role Insights**
    // Fetch all roles meeting the conditions: initial = true, duplicate = false
    const roles = await Role.find({ initial: true, duplicate: false });

    const roleInsights = {
      primaryRoles: {}, // Store categorized primary roles and their subroles
      standaloneRoles: [], // Store roles with no subroles
    };

    // Iterate through the roles to categorize them
    roles.forEach(role => {
      const { roleName } = role;

      // Exclude "Admin" role
      if (roleName === 'Admin') return;

      // Check if it's a subrole (contains parentheses)
      const isSubrole = roleName.includes('(');

      if (isSubrole) {
        // Extract the primary role from the subrole
        const primaryRole = roleName.split(' (')[0].trim();

        // Add to the subroles of the corresponding primary role
        if (!roleInsights.primaryRoles[primaryRole]) {
          roleInsights.primaryRoles[primaryRole] = { subroles: [] };
        }
        roleInsights.primaryRoles[primaryRole].subroles.push(roleName);
      } else {
        // If it's not a subrole, add it as a standalone role or primary role
        if (!roleInsights.primaryRoles[roleName]) {
          roleInsights.primaryRoles[roleName] = { subroles: [] };
        }

        // Standalone roles have no subroles
        if (!roles.some(r => r.roleName.startsWith(roleName + ' ('))) {
          roleInsights.standaloneRoles.push(roleName);
        }
      }
    });

    // **3. Fetch User Role Insights**
    const primaryRoleCounts = await User.aggregate([
      {
        $project: {
          primaryRole: { 
            $arrayElemAt: ["$role", 0] // Extract the first role as primaryRole
          },
        },
      },
      {
        $addFields: {
          primaryRoleObjectId: { $toObjectId: "$primaryRole" }, // Convert role string to ObjectId
        },
      },
      {
        $lookup: {
          from: 'roles', // The Role collection
          localField: 'primaryRoleObjectId', // The field to match (converted ObjectId)
          foreignField: '_id', // Match to the _id field in the Role model
          as: 'roleDetails', // Create a new field 'roleDetails' containing the role document
        },
      },
      {
        $unwind: '$roleDetails', // Unwind the array of roleDetails to get the role document
      },
      {
        $group: {
          _id: '$roleDetails.roleName', // Group by roleName extracted from the Role collection
          count: { $sum: 1 }, // Count the number of users
        },
      },
      {
        $project: {
          role: '$_id', // Rename _id to role for clarity
          count: 1, // Include count
          _id: 0, // Exclude _id field
        },
      },
    ]);

    const subroleCounts = await User.aggregate([
      {
        $project: {
          subroles: { $slice: ["$role", 1, { $size: "$role" }] }, // Exclude the first element (primary role)
        },
      },
      {
        $addFields: {
          subroleObjectIds: { 
            $map: { 
              input: "$subroles", // The subroles array
              as: "subrole", // Each element in the subroles array
              in: { $toObjectId: "$$subrole" } // Convert each string element to ObjectId
            }
          }
        },
      },
      {
        $unwind: "$subroleObjectIds", // Unwind the array of ObjectIds
      },
      {
        $lookup: {
          from: 'roles', // The Role collection
          localField: 'subroleObjectIds', // Match the subrole ObjectIds
          foreignField: '_id', // Match to the _id field in the Role collection
          as: 'roleDetails', // Create a new field 'roleDetails' containing the role document
        },
      },
      {
        $unwind: '$roleDetails', // Unwind the array of roleDetails to get the role document
      },
      {
        $group: {
          _id: '$roleDetails.roleName', // Group by roleName extracted from the Role collection
          count: { $sum: 1 }, // Count the number of users
        },
      },
      {
        $project: {
          role: '$_id', // Rename _id to role for clarity
          count: 1, // Include count
          _id: 0, // Exclude _id field
        },
      },
    ]);

    // Add the following in the backend where you are processing role insights
roleInsights.primaryRoles = roleInsights.primaryRoles || {};
roleInsights.standaloneRoles = roleInsights.standaloneRoles || [];

// Map the user count data to the primary roles
primaryRoleCounts.forEach(roleCount => {
  const { role, count } = roleCount;
  if (roleInsights.primaryRoles[role]) {
    roleInsights.primaryRoles[role].userCount = count;
  }
});

    
    
    

    // **4. Combine All Insights and Send Response**
    res.json({
      requestInsights: {
        requestTypeCounts,
        requestStatusCounts,
      },
      roleInsights,
      userRoleInsights: {
        primaryRoleCounts,
        subroleCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ message: 'Error fetching dashboard analytics', error: error.message });
  }
};

module.exports = { GetDashboardAnalytics };

  // Update the exports section
  module.exports = {
    GetDashboardAnalytics  // Add this new export
  }