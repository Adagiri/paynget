const { combineResolvers } = require('graphql-resolvers');
const {
  deleteUserByEmail,
  deleteUser,
  editUser,
  addBank,
  deleteBank,
  getLoggedInUser,

  triggerAddCard,
  deleteCard,
} = require('../controllers/users.js');
const { protectUser } = require('../middleware/auth.js');

module.exports = {
  Query: {
    user: combineResolvers(protectUser, getLoggedInUser),
    user_addCard_trigger: combineResolvers(protectUser, triggerAddCard),
  },

  Mutation: {
    user_edit: combineResolvers(protectUser, editUser),
    user_delete: combineResolvers(protectUser, deleteUser),
    user_deleteByEmail: deleteUserByEmail,

    user_addBank: combineResolvers(protectUser, addBank),
    user_deleteBank: combineResolvers(protectUser, deleteBank),
    user_deleteCard: combineResolvers(protectUser, deleteCard),
  },
};
