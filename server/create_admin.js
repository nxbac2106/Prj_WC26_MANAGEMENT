// create_admin.js - Tao bang users (neu chua co) va tao / cap nhat mat khau tai khoan admin.
//
// Cach chay (khong nhan thong tin qua tham so dong lenh, khong in mat khau ra log):
//   PowerShell:  $env:ADMIN_USER="admin"; $env:ADMIN_PASSWORD="mat_khau_it_nhat_8_ky_tu"; node create_admin.js
//   Git Bash:    ADMIN_USER=admin ADMIN_PASSWORD=... node create_admin.js
//
// Tai khoan da ton tai -> chi cap nhat password_hash. Chua co -> chen moi voi role 'admin'.
require('dotenv').config();
const sql = require('mssql'), bcrypt = require('bcryptjs');

// Dung lai dung cau hinh ket noi voi server.js (doc tu .env)
const cfg = { server: process.env.DB_SERVER, database: process.env.DB_NAME || 'WorldCup26_db',
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  options: { encrypt: false, trustServerCertificate: true } };
if (process.env.DB_PORT) cfg.port = +process.env.DB_PORT;

const ADMIN_USER = process.env.ADMIN_USER, ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Validate: username 3-50 ky tu (chu, so, _ . -); password toi thieu 8 ky tu
if (!/^[A-Za-z0-9_.-]{3,50}$/.test(ADMIN_USER || '')) {
  console.error('ADMIN_USER khong hop le: 3-50 ky tu, chi gom chu cai, so va cac ky tu "_" "." "-"'); process.exit(1);
}
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('ADMIN_PASSWORD phai co it nhat 8 ky tu'); process.exit(1);
}

// Giong sql/auth.sql: tu tao bang users neu chua ton tai de chay doc lap voi init.sql
const CREATE_USERS = `if object_id('users','U') is null
create table users (
    user_id int identity(1,1) primary key,
    username nvarchar(50) not null unique,
    password_hash nvarchar(100) not null,
    role nvarchar(20) not null default 'admin',
    created_at datetime2 not null default sysutcdatetime()
)`;

(async () => {
  const pool = await sql.connect(cfg);
  await pool.request().query(CREATE_USERS);

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);   // bcrypt cost 12
  const chk = await pool.request().input('username', sql.NVarChar(50), ADMIN_USER)
    .query('select user_id from users where username = @username');
  const existed = chk.recordset.length > 0;

  if (existed) {
    await pool.request().input('username', sql.NVarChar(50), ADMIN_USER).input('hash', sql.NVarChar(100), hash)
      .query('update users set password_hash = @hash where username = @username');
    console.log(`Da cap nhat mat khau cho tai khoan '${ADMIN_USER}' (role admin)`);
  } else {
    await pool.request().input('username', sql.NVarChar(50), ADMIN_USER).input('hash', sql.NVarChar(100), hash)
      .query(`insert into users (username, password_hash, role) values (@username, @hash, 'admin')`);
    console.log(`Da tao tai khoan admin '${ADMIN_USER}'`);
  }

  await pool.close();
})().catch(e => { console.error('Loi:', e.message); process.exit(1); });
