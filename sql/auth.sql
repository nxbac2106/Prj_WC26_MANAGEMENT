-- ============================================================
-- AUTH: bang users cho dang nhap (chi admin).
-- Khong dung vao cac bang du lieu hien co cua WorldCup26_db.
-- Chay 1 lan sau init.sql (hoac de server/create_admin.js tu tao bang nay khi chay).
-- ============================================================
use WorldCup26_db
go

if object_id('users', 'U') is null
begin
    create table users (
        user_id int identity(1,1) primary key,
        username nvarchar(50) not null unique,
        password_hash nvarchar(100) not null,      -- bcrypt hash (60 ky tu), khong bao gio luu mat khau that
        role nvarchar(20) not null default 'admin',
        created_at datetime2 not null default sysutcdatetime()
    )
end
go

-- Kiem tra
select * from users
go
