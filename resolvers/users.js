const { combineResolvers } = require('graphql-resolvers');
const { deleteUserByEmail, deleteUser } = require('../controllers/users.js');
const { protectUser } = require('../middleware/auth.js');

module.exports = {
  Mutation: {
    user_delete: combineResolvers(protectUser, deleteUser),
    user_deleteByEmail: deleteUserByEmail,
  },
};
