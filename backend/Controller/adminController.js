const Role = require('../Models/Role')
const User = require('../Models/User')
const Request = require('../Models/Request');


let GetAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()


    res.status(200).json({
      requests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message
    });
  }
};


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

let ProcessRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    // Fetch the request by ID
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (action === "approved" && request.requestType === "signup") {
      // Handle signup approval (same as your current code)
      const role = await Role.findOne({ roleName: request.requestData.role, initial: true, duplicate: false });

      if (!role) {
        return res.status(404).json({ message: `Role "${request.requestData.role}" not found or invalid.` });
      }

      const newUser = new User({
        email: request.requestData.email,
        name: request.requestData.name,
        passwordHash: request.requestData.password,
        role: [role._id.toString()],
        status: "active",
        googleId: request.googleId || "",
      });

      await newUser.save();
      request.status = "approved";
      await request.save();

      await sendEmail({
        to: request.requestData.email,
        subject: "Signup Request Approved",
        text: `Dear ${request.requestData.name},\n\nYour signup request has been approved. You can now log in to your account.\n\nThank you!`,
      });

      return res.status(200).json({ message: "Signup request approved, and user created." });
    } else if (action === "rejected" && request.requestType === "signup") {
      // Handle signup rejection
      request.status = "rejected";
      await request.save();

      await sendEmail({
        to: request.requestData.email,
        subject: "Signup Request Rejected",
        text: `Dear ${request.requestData.name},\n\nWe regret to inform you that your signup request has been rejected.\n\nIf you have any questions, please contact support.\n\nThank you!`,
      });

      return res.status(200).json({ message: "Signup request rejected." });
    } else if (request.requestType === "role change") {
      // Handle role change request
      const newRole = request.requestData.newRole;

      // Find the role
      const role = await Role.findOne({ roleName: request.requestData.newRole, initial: true, duplicate: false });

      if (!role) {
        return res.status(404).json({ message: `Role "${newRole}" not found.` });
      }

      // Fetch the user to update their roles
      const user = await User.findOne({ email: request.requestData.email });

      if (!user) {
        return res.status(404).json({ message: `User with email "${request.requestData.email}" not found.` });
      }

      if (action === "approved") {
        // Add the role to the user's roles array
        if (!user.role.includes(role._id.toString())) {
          user.role.push(role._id.toString());
        }

        await user.save();
        request.status = "approved";
        await request.save();

        // Send approval email
        await sendEmail({
          to: request.requestData.email,
          subject: "Role Change Request Approved",
          text: `Dear ${user.name},\n\nYour request to add the "${newRole}" role has been approved. You now have additional permissions associated with this role. Please login again to avail those permissions.\n\nThank you!`,
        });

        return res.status(200).json({ message: "Role change request approved, and user updated." });
      } else if (action === "rejected") {
        // Update the request status to rejected
        request.status = "rejected";
        await request.save();

        // Send rejection email
        await sendEmail({
          to: request.requestData.email,
          subject: "Role Change Request Rejected",
          text: `Dear ${user.name},\n\nYour request to add the "${newRole}" role has been rejected.\n\nIf you have any questions, please contact support.\n\nThank you!`,
        });

        return res.status(200).json({ message: "Role change request rejected." });
      }
    } else if (request.requestType === "permission change") {
      // Handle permission change request
      const newPermissions = request.requestData.permissions;

      // Find the user
      const user = await User.findOne({ email: request.requestData.email });

      if (!user) {
        return res.status(404).json({ message: `User with email "${request.requestData.email}" not found.` });
      }

      // Fetch the primary role
      const primaryRoleId = user.role[0];
      const primaryRole = await Role.findById(primaryRoleId);

      if (!primaryRole) {
        return res.status(404).json({ message: "Primary role not found." });
      }

      if (action === "approved") {
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
        request.status = "approved";
        await request.save();

        // Send approval email
        await sendEmail({
          to: request.requestData.email,
          subject: "Permission Change Request Approved",
          text: `Dear ${user.name},\n\nYour request to update permissions has been approved. The following permissions have been added: ${newPermissions.join(', ')}.\n\nPlease login again to avail these permissions.\n\nThank you!`,
        });

        return res.status(200).json({ message: "Permission change request approved, and user updated." });
      } else if (action === "rejected") {
        // Update the request status to rejected
        request.status = "rejected";
        await request.save();

        // Send rejection email
        await sendEmail({
          to: request.requestData.email,
          subject: "Permission Change Request Rejected",
          text: `Dear ${user.name},\n\nYour request to update permissions has been rejected. The following permissions were requested: ${newPermissions.join(', ')}.\n\n If you have any questions, please contact support.\n\nThank you!`,
        });

        return res.status(200).json({ message: "Permission change request rejected." });
      }
    }

    res.status(400).json({ message: "Invalid action or request type." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};



module.exports = {
  GetAllRequests,
  ProcessRequest,
}