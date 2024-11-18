const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  requestType: { 
    type: String, 
    required: true, 
    enum: ['signup', 'role change', 'permission change'] 
  },
  requestData: {
    email: { type: String, required: true },
    password: { 
      type: String, 
      required: function() { return this.requestType === 'signup'; } 
    },
    name: { 
      type: String, 
      required: function() { return this.requestType === 'signup'; }  
    },
    role: { 
      type: String, 
      required: function() { return this.requestType === 'signup' || this.requestType === 'role change'; }  
    },
    newRole: { 
      type: String, 
      required: function() { return this.requestType === 'role change'; }  
    },
    permissions: {
      type: [String], 
      required: function() { return this.requestType === 'permission change'; }  
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
