const mongoose = require("mongoose");

const roleModel = require("./schemas/roles");

// Kết nối MongoDB
const mongoUrl = "mongodb://localhost:27017/NNPTUD-C3";

async function setupRoles() {
  try {
    // Kết nối database
    await mongoose.connect(mongoUrl);
    console.log('✅ Kết nối MongoDB thành công');

    // Các roles cần tạo
    const rolesToCreate = [
      {
        name: "admin",
        description: "Quản trị viên - có toàn quyền truy cập"
      },
      {
        name: "moderator",
        description: "Người quản lý - có quyền quản lý nội dung"
      },
      {
        name: "user",
        description: "Người dùng thường - quyền truy cập cơ bản"
      }
    ];

    console.log('\n🔍 Đang kiểm tra và tạo roles...\n');

    for (const roleData of rolesToCreate) {
      // Kiểm tra role đã tồn tại chưa
      const existingRole = await roleModel.findOne({ 
        name: roleData.name,
        isDeleted: false 
      });

      if (existingRole) {
        console.log(`✅ Role '${roleData.name}' đã tồn tại (ID: ${existingRole._id})`);
      } else {
        // Tạo role mới
        const newRole = new roleModel(roleData);
        await newRole.save();
        console.log(`✅ Tạo role '${roleData.name}' thành công (ID: ${newRole._id})`);
      }
    }

    console.log('\n📋 Danh sách tất cả roles:');
    const allRoles = await roleModel.find({ isDeleted: false });
    allRoles.forEach(role => {
      console.log(`  - ${role.name}: ${role.description}`);
    });

    console.log('\n✅ Setup roles hoàn tất!\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

setupRoles();
