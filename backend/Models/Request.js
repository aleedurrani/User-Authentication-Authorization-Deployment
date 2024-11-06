const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  requestType: { 
    type: String, 
    required: true, 
    enum: ['signup', 'role change', 'permission change']  // Limit to these request types
  },
  requestData: {
    email: { type: String, required: true },
    password: { 
      type: String, 
      required: function() { return this.requestType === 'signup'; }  // Required only for signup
    },
    name: { 
      type: String, 
      required: function() { return this.requestType === 'signup'; }  // Required only for signup
    },
    role: { 
      type: String, 
      required: function() { return this.requestType === 'signup' || this.requestType === 'role change'; }  // Required for signup and role change
    },
    newRole: { 
      type: String, 
      required: function() { return this.requestType === 'role change'; }  // Required only for role change
    },
    permissions: {
      type: [String],  // Array of permissions
      required: function() { return this.requestType === 'permission change'; }  // Required only for permission change
    },
  },
  googleId: { 
    type: String, 
  },
  requestTime: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
});

const Request = mongoose.model('Request', RequestSchema);

module.exports = Request;
