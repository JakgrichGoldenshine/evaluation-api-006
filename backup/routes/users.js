
const express = require('express');
const db = require('../db');

const router = express.Router();

// คอลัมน์ที่ส่งออกไปได้ (ไม่มี password_hash)
// พร้อมชื่อแผนกจากตาราง departments
const SELECT_USER = `
    SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.position,
        u.phone,
        u.department_id,
        d.name AS department
    FROM users u
    LEFT JOIN departments d
        ON u.department_id = d.id
`;

// GET /api/users ค้นหา (?q=ชื่อ&department_id=เลขแผนก&role=บทบาท)
router.get('/', async (req, res) => {
    try {
        const { q, department_id, role } = req.query;

        let sql = SELECT_USER + ' WHERE 1 = 1';
        const params = [];

        if (q) {
            sql += ' AND u.full_name LIKE ?';
            params.push('%' + q + '%');
        }

        if (department_id) {
            sql += ' AND u.department_id = ?';
            params.push(department_id);
        }

        if (role) {
            sql += ' AND u.role = ?';
            params.push(role);
        }

        sql += ' ORDER BY u.id';

        console.log(sql, params);

        const [rows] = await db.query(sql, params);

        res.json({
            status: 'success',
            message: 'พบ ' + rows.length + ' คน',
            data: rows
        });

    } catch (error) {
        console.error('GET /api/users error:', error);

        res.status(500).json({
            status: 'error',
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบุคลากร',
            data: null
        });
    }
});

// GET /api/users/3 ดูข้อมูล 1 คน
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const [rows] = await db.query(
            SELECT_USER + ' WHERE u.id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'ไม่พบบุคลากร id ' + id,
                data: null
            });
        }

        res.json({
            status: 'success',
            message: 'พบข้อมูล',
            data: rows[0]
        });

    } catch (error) {
        console.error('GET /api/users/:id error:', error);

        res.status(500).json({
            status: 'error',
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบุคลากร',
            data: null
        });
    }
});

module.exports = router;
