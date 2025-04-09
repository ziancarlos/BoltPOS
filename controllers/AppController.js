class AppController {
  static async showDashboard(req, res) {
    const { username, role, userId } = req.user;
    const currentPath = req.path;

    res.render("Dashboard", {
      user: {
        userId,
        username,
        role,
      },
      currentPath,
    });
  }
}

module.exports = AppController;
