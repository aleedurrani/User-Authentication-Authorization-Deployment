const Role = require('../Models/Role')
const User = require('../Models/User')
const { format } = require('date-fns');


const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    throw new Error("Email sending failed.");
  }
};


const GetAllUsers = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({}, '_id name email role');

    // Check if users exist
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    // Get unique role IDs from all users
    const roleIds = [...new Set(users.flatMap(user => user.role))];

    // Fetch roles by their IDs
    const roles = await Role.find({ _id: { $in: roleIds } });

    // Create a map of role IDs to role names for quick lookup
    const roleMap = new Map(roles.map(role => [role._id.toString(), role.roleName]));

    // Transform users to include role names
    const usersWithRoles = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.role.map(roleId => roleMap.get(roleId.toString()) || 'Unknown Role') // Handle missing roles
    }));

    return res.status(200).json(usersWithRoles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


const GetUserProfile = async (req, res) => {
  const userId = req.body.user_id; // Assuming the user ID is still being passed via res.locals.userId
  
  try {
    // Fetch the user profile along with their roles
    const userProfile = await User.findById(userId)

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Extract role IDs from the user's role array
    const roleIds = userProfile.role;

    if (!roleIds || roleIds.length === 0) {
      return res.status(405).json({ message: 'No roles found' });
    }

    // Fetch role details for the role IDs
    const roles = await Role.find({ _id: { $in: roleIds } });

    

    if (!roles || roles.length === 0) {
      return res.status(405).json({ message: 'No roles found' });
    }

    // Create a map of roles by their ID for quick lookup
    const roleMap = new Map(roles.map((role) => [role._id.toString(), role]));

    // Reorder roles based on the order of roleIds
    const sortedRoles = roleIds.map((id) => roleMap.get(id.toString()));

    // Extract role names in the correct order
    const roleNames = sortedRoles.map((role) => role.roleName);

    // Format the join date
    const memberSince = format(new Date(userProfile.createdAt), 'MMMM dd, yyyy');

    // Respond with user profile data
    res.status(200).json({
      name: userProfile.name,
      email: userProfile.email,
      status: userProfile.status,
      role: roleNames,
      permissions: roles.flatMap((role) => role.permissions),
      joined: memberSince,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




const GetAvailableRoles = async (req, res) => {
  const userId = req.body.user_id;

  const userProfile = await User.findById(userId)

    if (!userProfile) {
      return res.status(401).json({ message: 'User profile not found' });
    }

  // Extract role IDs from the user's role array
  const roleIds = userProfile.role;


  if (!roleIds || roleIds.length === 0) {
    return res.status(400).json({ message: 'User roles not found' });
  }

  try {
    // Fetch role names based on the role IDs
    const roles = await Role.find({ _id: { $in: roleIds } });

    if (roles.length === 0) {
      return res.status(405).json({ message: 'Roles not found' });
    }

    // Extract the first word of the first role's name
    const firstRolePrefix = roles[0].roleName.split(' ')[0]; // Split and take the first word

    // Find all other roles that match the prefix, excluding the roles the user already has
    const availableRoles = await Role.find({
      roleName: { $regex: `^${firstRolePrefix}`, $options: 'i' }, // Match roles starting with the prefix
      _id: { $nin: roleIds }, // Exclude roles already assigned to the user
      initial: true,
      duplicate: false
    });

    if (availableRoles.length === 0) {
      return res.status(404).json({ message: 'No available roles found' });
    }

    // Map the roles with their permissions
    const rolesWithPermissions = availableRoles.map((role) => ({
      roleName: role.roleName,
      permissions: role.permissions,
    }));

    res.status(200).json({ availableRoles: rolesWithPermissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



const RoleChange = async (req, res) => {
  const userId = req.body.user_id;
  

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const newRole = await Role.findOne({
      roleName: req.body.newRole,
      initial: true,
      duplicate: false
    });

    if (!newRole) {
      return res.status(404).json({ message: `Role "${req.body.newRole}" is not available or invalid.` });
    }

    if (!user.role.includes(newRole._id.toString())) {
      user.role.push(newRole._id.toString());
    }

    await user.save();

    // Send approval email
    await sendEmail({
      to: user.email,
      subject: "Role Granted",
      text: `Dear ${user.name},\n\nYou have been granted the new role : "${newRole.roleName}". You now have additional permissions associated with this role. Please login again to avail those permissions.\n\nThank you!`,
    });

    return res.status(200).json({ message: "Role granted, and user updated." });

    

  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};



const GetAvailablePermissions = async (req, res) => {
  const userId = req.body.user_id;

  const userProfile = await User.findById(userId)

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

  // Extract role IDs from the user's role array
  const roleIds = userProfile.role;

  if (!roleIds || roleIds.length === 0) {
    return res.status(400).json({ message: 'User roles not found' });
  }

  try {
    // Fetch role names based on the role IDs
    const roles = await Role.find({ _id: { $in: roleIds } });

    if (roles.length === 0) {
      return res.status(404).json({ message: 'Roles not found' });
    }

    // Extract the first word of the first role's name
    const firstRolePrefix = roles[0].roleName.split(' ')[0]; // Split and take the first word

    // Find all other roles that match the prefix, excluding the roles the user already has
    const availableRoles = await Role.find({
      roleName: { $regex: `^${firstRolePrefix}`, $options: 'i' }, // Match roles starting with the prefix
      _id: { $nin: roleIds }, // Exclude roles already assigned to the user
      initial: true,
    });

    if (availableRoles.length === 0) {
      return res.status(404).json({ message: 'No available roles found' });
    }

    // Map the roles to return only the permissions
    const rolePermissions = availableRoles.map((role) => role.permissions);

    res.status(200).json({ availableRolePermissions: rolePermissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};





const PermissionChange = async (req, res) => {
  const userId = req.body.user_id;

  try {

    
    const newPermissions = req.body.newPermissions;

    // Find the user
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: `User with email "${request.requestData.email}" not found.` });
    }

    // Fetch the primary role
    const primaryRoleId = user.role[0];
    const primaryRole = await Role.findById(primaryRoleId);

    if (!primaryRole) {
      return res.status(404).json({ message: "Primary role not found." });
    }

  
      if (primaryRole.initial) {
        // Create a new role based on the primary role
        const newRole = new Role({
          roleName: `${primaryRole.roleName}`,
          permissions: [...primaryRole.permissions, ...newPermissions], // Add new permissions
          initial: false, // Set initial to false for the new role
          duplicate: true,
        });

        await newRole.save();

        // Update user's role array: replace primary role with the new role
        user.role[0] = newRole._id.toString();
      } else {
        // Update the permissions of the existing role
        primaryRole.permissions = [...new Set([...primaryRole.permissions, ...newPermissions])]; // Avoid duplicates
        await primaryRole.save();
      }

      await user.save();

      // Send approval email
      await sendEmail({
        to: user.email,
        subject: "Permissions Granted",
        text: `Dear ${user.name},\n\nYou have been granted the following permissions: ${newPermissions.join(', ')}.\n\nPlease login again to avail these permissions.\n\nThank you!`,
      });

      return res.status(200).json({ message: "Permission granted, and user updated." });
    
    

  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


const GetRolePermissions = async (req, res) => {
  const  roleName  = req.body.selectedRole;

  if (!roleName) {
    return res.status(400).json({ message: 'Role name is required' });
  }

  try {
    // Search for the role in the Role schema with `initial: true` and the specified `roleName`
    const role = await Role.findOne({ roleName, initial: true });

    if (!role) {
      return res.status(404).json({ message: 'Role not found or does not have initial permissions' });
    }

    // Return the permissions attached to the role
    res.status(200).json({ permissions: role.permissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



const RemoveRole = async (req, res) => {
  const userId = req.body.user_id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const roleToRemove = await Role.findOne({
      roleName: req.body.roleToRemove,
      initial: true,
    });

    if (!roleToRemove) {
      return res.status(404).json({ message: `Role "${req.body.roleToRemove}" not found.` });
    }

    // Prevent removing the last role
    if (user.role.length <= 1) {
      return res.status(400).json({ message: "Cannot remove the last role from user." });
    }

    // Remove the role from user's roles array
    user.role = user.role.filter(roleId => roleId.toString() !== roleToRemove._id.toString());
    await user.save();

    // Send notification email
    await sendEmail({
      to: user.email,
      subject: "Role Removed",
      text: `Dear ${user.name},\n\nThe role "${roleToRemove.roleName}" has been removed from your account. Some permissions associated with this role may no longer be available. Please login again for these changes to take effect.\n\nThank you!`,
    });

    return res.status(200).json({ message: "Role removed successfully." });

  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


const GetAvailableRemovePermissions = async (req, res) => {
  const userId = req.body.user_id;

  try {
    // Fetch the user profile
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    const roleIds = userProfile.role;

    if (!roleIds || roleIds.length === 0) {
      return res.status(405).json({ message: 'No roles found' });
    }

    // Fetch roles by role IDs
    const roles = await Role.find({ _id: { $in: roleIds } });

    if (!roles || roles.length === 0) {
      return res.status(405).json({ message: 'No roles found' });
    }

    // Identify the first role
    const firstRole = roles.find((role) => role._id.toString() === roleIds[0].toString());

    if (!firstRole) {
      return res.status(404).json({ message: 'First role not found' });
    }

    let excludedPermissions = [];

    if (firstRole.initial) {
      // Exclude permissions of the first role if `initial = true`
      excludedPermissions = firstRole.permissions;
    } else {
      // Find a role with the same name as the first role and `initial = true`
      const matchingInitialRole = await Role.findOne({
        roleName: firstRole.roleName,
        initial: true,
      });

      if (matchingInitialRole) {
        excludedPermissions = matchingInitialRole.permissions;
      }
    }

    // Combine permissions from all roles
    const allPermissions = roles.flatMap((role) => role.permissions);

    // Exclude permissions from the list
    const filteredPermissions = allPermissions.filter(
      (permission) => !excludedPermissions.includes(permission)
    );

    // Respond with the permissions
    res.status(200).json({
      availableRemovePermissions: [...new Set(filteredPermissions)], // Ensure no duplicates
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



const RemovePermissions = async (req, res) => {
  const userId = req.body.user_id;
  const removePermissions = req.body.removePermissions;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Keep track of roles to be removed
    const updatedRoles = [];
    const removedRoles = [];

    // Process each role the user has
    for (let i = 0; i < user.role.length; i++) {
      const roleId = user.role[i];
      const currentRole = await Role.findById(roleId);

      if (!currentRole) {
        continue; // Skip if role not found
      }

      // Filter out the permissions to be removed
      const remainingPermissions = currentRole.permissions.filter(
        permission => !removePermissions.includes(permission)
      );

      if (i === 0 ) {
        if (currentRole.initial) {
           continue
        } else {
          currentRole.permissions = remainingPermissions;
          await currentRole.save();
        }
      } else {
        if (remainingPermissions.length === 0) {
           removedRoles.push(currentRole._id.toString());
           await Role.findByIdAndDelete(currentRole._id);
        } else {
          if (currentRole.initial){
            const newRole = new Role({
              roleName: `${currentRole.roleName}`,
              permissions: remainingPermissions,
              initial: false,
              duplicate: true,
            });
            await newRole.save();
            removedRoles.push(currentRole._id.toString())
            updatedRoles.push(newRole._id.toString());
          } else {
            currentRole.permissions = remainingPermissions;
            await currentRole.save();
          }
        }

      }
      
    }

    
    if (removedRoles.length > 0) {
      user.role = user.role.filter(roleId => !removedRoles.includes(roleId.toString()));
    }

    // Then add the updated roles
    if (updatedRoles.length > 0) {
      user.role.push(...updatedRoles);
    }

    await user.save();


    // Send notification email
    await sendEmail({
      to: user.email,
      subject: "Permissions Removed",
      text: `Dear ${user.name},\n\nThe following permissions have been removed from your roles:\n\n ${removePermissions.join(', ')}.\n\nPlease login again for these changes to take effect.\n\nThank you!`,
    });

    return res.status(200).json({ message: "Permissions removed successfully from all applicable roles." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};







module.exports = {
  
  GetAllUsers,
  GetUserProfile,
  GetAvailableRoles,
  RoleChange,
  GetAvailablePermissions,
  PermissionChange,
  GetRolePermissions,
  RemoveRole,
  RemovePermissions,
  GetAvailableRemovePermissions,
 
}