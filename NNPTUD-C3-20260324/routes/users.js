var express = require("express");
var router = express.Router();
let bcrypt = require('bcrypt')
let userModel = require("../schemas/users");
let roleModel = require("../schemas/roles");
let { validatedResult, CreateAnUserValidator, ModifyAnUserValidator } = require('../utils/validator')
let userController = require('../controllers/users')
let { CheckLogin, checkRole } = require('../utils/authHandler')
let { uploadExcel } = require('../utils/uploadHandler')
let { importUsersFromExcel } = require('../utils/excelImporter')


router.get("/", CheckLogin, checkRole("ADMIN","MODERATOR"), async function (req, res, next) {//ADMIN
  let users = await userController.GetAllUser()
  res.send(users);
});

router.get("/:id", async function (req, res, next) {
  let result = await userController.GetUserById(
    req.params.id
  )
  if (result) {
    res.send(result);
  } else {
    res.status(404).send({ message: "id not found" })
  }
});

router.post("/", CreateAnUserValidator, validatedResult, async function (req, res, next) {
  
  try {
    let user = await userController.CreateAnUser(
      req.body.username, req.body.password,
      req.body.email, req.body.role
    )
    res.send(user);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put("/:id", ModifyAnUserValidator, validatedResult, async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate
      (id, req.body, { new: true });

    if (!updatedItem) return res.status(404).send({ message: "id not found" });

    let populated = await userModel
      .findById(updatedItem._id)
    res.send(populated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// Import users from Excel file
router.post("/import", uploadExcel.single('file'), async function (req, res, next) {
  try {
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).send({ 
        message: "No file uploaded" 
      });
    }

    // Get the "user" role
    let userRole = await roleModel.findOne({ name: "user" });
    
    if (!userRole) {
      return res.status(400).send({
        message: "User role not found in system. Please create a 'user' role first."
      });
    }

    // Import users from Excel
    const results = await importUsersFromExcel(req.file.path, userRole._id);

    res.status(200).send({
      message: "Import process completed",
      summary: {
        totalProcessed: results.success + results.failed,
        successfullyCreated: results.success,
        failed: results.failed
      },
      createdUsers: results.createdUsers,
      errors: results.errors
    });

  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;