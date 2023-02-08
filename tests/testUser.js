const testUser = [
  {
    status: "success",
    code: 200,
    data: {
      user: {
        email: "test_user@mail.com",
        subscription: "pro",
      },
      token: "token",
    },
  },
];

const getTestUser = async (req, res) => {
  res.json(testUser);
};

module.exports = getTestUser;
