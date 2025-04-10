const { Category, Menu, Sequelize } = require("../models");
const {
  setSuccessAlert,
  receiveSuccessAlert,
  setErrorAlert,
  receiveErrorAlert,
} = require("../helpers/helper");
const validate = require("../validations/validate");
const { categoryIdValidation } = require("../validations/CategoryValidation");
const SwalError = require("../errors/SwalError");
const AlertError = require("../errors/AlertError");

class CategoryController {
  static async getAll(req, res, next) {
    const { username, role, userId, fullName } = req.user;
    const currentPath = req.path;
    const successMessage = receiveSuccessAlert(req);
    const errorMessage = receiveErrorAlert(req);

    try {
      const categories = await Category.findAll({
        attributes: [
          "categoryId",
          "name",
          [Sequelize.fn("COUNT", Sequelize.col("menus.menuId")), "countMenus"],
        ],
        include: [
          {
            model: Menu,
            as: "menus",
            attributes: [],
            required: false,
          },
        ],
        group: ["Category.categoryId"],
        order: [["categoryId", "DESC"]],
      });

      res.render("category/DataCategory", {
        categories,
        successMessage,
        errorMessage,

        user: {
          userId,
          username,
          role,
          fullName,
        },
        currentPath,
      });
    } catch (e) {
      next(e);
    }
  }

  static async get(req, res, next) {
    const { username, role, userId, fullName } = req.user;
    const currentPath = req.path;

    try {
      let { categoryId } = req.params;

      categoryId = validate(categoryIdValidation, categoryId, (message) => {
        throw new SwalError(message[0].message, "/categories");
      });

      const category = await Category.getCategoryById(categoryId);

      if (!category) {
        throw new SwalError("Tidak menemukan kategori.", "/categories");
      }

      res.render("category/DetailCategory", {
        category,

        user: {
          userId,
          username,
          role,
          fullName,
        },
        currentPath,
      });
    } catch (e) {
      next(e);
    }
  }

  static async createForm(req, res, next) {
    const { username, role, userId, fullName } = req.user;
    const currentPath = req.path;
    let { errors } = req.query;

    if (errors) {
      try {
        errors = JSON.parse(decodeURIComponent(errors));
      } catch (e) {
        errors = [{ message: "Error parsing error messages" }];
      }
    }

    try {
      res.render("category/CreateCategory", {
        user: {
          userId,
          username,
          role,
          fullName,
        },
        currentPath,
        errors,
      });
    } catch (e) {
      next(e);
    }
  }

  static async create(req, res, next) {
    try {
      const { name } = req.body;

      try {
        await Category.create({ name });
      } catch (e) {
        throw new AlertError(e.errors, `/categories/add`);
      }

      setSuccessAlert(req, "Berhasil menambahkan kategori.");

      res.redirect("/categories");
    } catch (e) {
      next(e);
    }
  }

  static async updateForm(req, res, next) {
    const { username, role, userId, fullName } = req.user;
    const currentPath = req.path;
    let { errors } = req.query;

    if (errors) {
      try {
        errors = JSON.parse(decodeURIComponent(errors));
      } catch (e) {
        errors = [{ message: "Error parsing error messages" }];
      }
    }

    try {
      let { categoryId } = req.params;

      categoryId = validate(categoryIdValidation, categoryId, (message) => {
        throw new SwalError(message[0].message, "/categories");
      });

      const category = await Category.findByPk(categoryId);

      if (!category) {
        throw new SwalError("Kategori tidak ditemukan.", "/categories");
      }

      res.render("category/UpdateCategory", {
        category,
        user: {
          userId,
          username,
          role,
          fullName,
        },
        currentPath,
        errors,
      });
    } catch (e) {
      next(e);
    }
  }

  static async update(req, res, next) {
    try {
      let { categoryId } = req.params;
      categoryId = validate(categoryIdValidation, categoryId, (message) => {
        throw new SwalError(message[0].message, "/categories");
      });

      const { name } = req.body;

      const category = await Category.findByPk(categoryId);

      if (!category) {
        throw new SwalError("Kategori tidak ditemukkan", "/categories");
      }

      if (name === category.name) {
        throw new AlertError(
          [{ message: "Tidak menemukan perubahaan apapun." }],
          `/categories/${categoryId}/edit`
        );
      }

      category.name = name;

      try {
        await category.save();
      } catch (e) {
        throw new AlertError(e.errors, `/categories/${categoryId}/edit`);
      }

      setSuccessAlert(req, "Berhasil mengubah kategori.");

      res.redirect("/categories");
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  static async delete(req, res, next) {
    try {
      let { categoryId } = req.params;

      categoryId = validate(categoryIdValidation, categoryId, (message) => {
        throw new SwalError(message[0].message, "/categories");
      });

      // Find category and include total related Menu count
      const category = await Category.findByPk(categoryId);

      if (!category) {
        throw new SwalError("Tidak menemukan kategori.", `/categories`);
      }

      const totalMenus = await Menu.findAll({
        where: {
          categoryId,
        },
      });

      if (totalMenus.length > 0) {
        throw new SwalError(
          "Kategori tidak dapat dihapus karena masih memiliki makanan.",
          `/categories`
        );
      }

      await category.destroy();

      setSuccessAlert(req, "Berhasil menghapus kategori.");

      res.redirect("/categories");
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
}

module.exports = CategoryController;
