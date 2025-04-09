const {
  setSuccessAlert,
  receiveSuccessAlert,
  setErrorAlert,
  receiveErrorAlert,
} = require("../helpers/helper");
const validate = require("../validations/validate");
const path = require("path");
const {
  createValidation,
  menuIdValidation,
} = require("../validations/MenuValidation");
const { Menu, Category } = require("../models");
const fs = require("fs");
const SwalError = require("../errors/SwalError");
const AlertError = require("../errors/AlertError");

class MenuController {
  static async getAll(req, res, next) {
    const { username, role, userId } = req.user;
    const currentPath = req.path;
    const successMessage = receiveSuccessAlert(req);
    const errorMessage = receiveErrorAlert(req);

    try {
      const menus = await Menu.findAll({
        attributes: ["menuId", "name", "price", "isAvailable"],
        include: [
          {
            model: Category,
            as: "category", // use the alias defined in the association
            attributes: ["categoryId", "name"], // don't return individual menu fields
            required: false, //left join
          },
        ],

        order: [["menuId", "DESC"]],
      });

      res.render("menu/DataMenu", {
        menus,
        successMessage,
        errorMessage,

        user: {
          userId,
          username,
          role,
        },
        currentPath,
      });
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  static async get(req, res, next) {
    const { username, role, userId } = req.user;
    const currentPath = req.path;

    try {
      let { menuId } = req.params;
      menuId = validate(menuIdValidation, menuId, (message) => {
        throw new SwalError(message[0].message, "/menus");
      });

      const menu = await Menu.findOne({
        where: {
          menuId,
        },
        include: {
          model: Category,
          as: "category",
          attributes: ["categoryId", "name"],
        },
      });

      if (!menu) {
        throw new SwalError("Tidak menemukan menu.", "/menus");
      }

      res.render("menu/DetailMenu", {
        menu,

        user: {
          userId,
          username,
          role,
        },
        currentPath,
      });
    } catch (e) {
      next(e);
    }
  }

  static async createForm(req, res, next) {
    const { username, role, userId } = req.user;
    const currentPath = req.path;
    let { errors } = req.query;

    if (errors) {
      try {
        errors = JSON.parse(decodeURIComponent(errors));
      } catch (e) {
        errors = [{ message: "Error parsing error messages" }];
      }
    }

    const categories = await Category.findAll();

    try {
      res.render("menu/createMenu", {
        categories,

        user: {
          userId,
          username,
          role,
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
      let body = req.body;
      body.price = parseInt(body.price.replace(/[^0-9]/g, ""), 10);
      body.fileName = req?.file?.filename;

      const { name, price, categoryId, fileName } = validate(
        createValidation,
        body,
        (message) => {
          throw new AlertError(message, "/menus/add");
        }
      );

      const category = await Category.findByPk(categoryId);
      if (!category) {
        throw new AlertError(
          [{ message: "Tidak menemukan kategori yang diberikan." }],
          "/menus/add"
        );
      }

      const request = {
        name,
        price: price,
        categoryId: parseInt(categoryId),
      };

      if (fileName) request.imageFile = fileName;

      try {
        await Menu.create(request);
      } catch (e) {
        throw new AlertError(e.errors, `/menus/add`);
      }

      setSuccessAlert(req, "Berhasil menambahkan menu.");

      res.redirect("/menus");
    } catch (e) {
      next(e);
    }
  }

  static async updateForm(req, res, next) {
    const { username, role, userId } = req.user;
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
      let { menuId } = req.params;
      menuId = validate(menuIdValidation, menuId, (message) => {
        throw new SwalError(message[0].message, "/menus");
      });

      const menu = await Menu.findByPk(menuId, {
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["categoryId", "name"],
          },
        ],
      });

      if (!menu) {
        throw new SwalError("Menu tidak ditemukan.", "/menus");
      }

      const categories = await Category.findAll();

      res.render("menu/UpdateMenu", {
        menu,
        categories,
        user: {
          userId,
          username,
          role,
        },
        currentPath,
        errors,
      });
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  static async update(req, res, next) {
    try {
      let { menuId } = req.params;
      menuId = validate(menuIdValidation, menuId, (message) => {
        throw new SwalError(message[0].message, "/menus");
      });

      const body = req.body;
      body.price = parseInt(body.price.replace(/[^0-9]/g, ""), 10);

      const { name, price, categoryId } = validate(
        createValidation,
        body,
        (message) => {
          throw new AlertError(message, `/menus/${req.params.menuId}/edit`);
        }
      );

      // Ambil menu
      const menu = await Menu.findByPk(menuId, {
        include: {
          model: Category,
          as: "category",
          attributes: ["categoryId", "name"],
        },
      });

      if (!menu) {
        throw new SwalError("Menu tidak ditemukkan", "/menus");
      }

      // Cek perubahan
      const noChanges =
        menu.name === name &&
        menu.price == price &&
        menu.category.categoryId == categoryId &&
        !req.file;

      if (noChanges) {
        throw new AlertError(
          [{ message: "Tidak ditemukan perubahaan data." }],
          `/menus/${menuId}/edit`
        );
      }

      // Jika ada gambar baru
      if (req.file) {
        // Hapus gambar lama jika ada
        if (menu.imageFile) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "public",
            "uploads",
            menu.imageFile
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        menu.imageFile = req.file.filename;
      }

      // Update nilai
      menu.name = name;
      menu.price = price;
      menu.categoryId = categoryId;

      try {
        await menu.save();
      } catch (e) {
        throw new AlertError(e.errors, `/menus/${menuId}/edit`);
      }

      setSuccessAlert(req, "Berhasil mengubah data menu.");
      res.redirect("/menus");
    } catch (e) {
      next(e);
    }
  }

  static async delete(req, res, next) {
    try {
      let { menuId } = req.params;

      menuId = validate(menuIdValidation, menuId, (message) => {
        throw new SwalError(message[0].message, "/menus");
      });

      const menu = await Menu.findByPk(menuId);

      if (!menu) {
        throw new SwalError("Tidak menemukan menu.", `/menus`);
      }

      await menu.destroy();

      setSuccessAlert(req, "Berhasil menghapus menu.");

      res.redirect("/menus");
    } catch (e) {
      next(e);
    }
  }
}

module.exports = MenuController;
