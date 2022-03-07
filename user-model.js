const { Schema } = require("./firebaseActions_old");
const Role = require("./roleModel");

const TestUser = new Schema("testUser", {
  firstName: String,
  lastName: String,
  teameeMail: String,
  secondaryEmail: String,
  phoneNumber: {
    type: Number
  },
  organizationalUnit: {
    type: Number,
    default: 0
  },
  roleId: String
});

module.exports = TestUser;
