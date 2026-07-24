// ================================
// นำเข้าโมดูลที่จำเป็น
// ================================

// โมดูลสำหรับสร้าง Web Server
const http = require("http");

// โมดูลสำหรับเชื่อมต่อ PostgreSQL
const { Pool } = require("pg");


// ================================
// ตั้งค่าการเชื่อมต่อฐานข้อมูล
// ================================
const pool = new Pool({
    // ดึง URL ของฐานข้อมูลจาก Environment Variable (Railway)
    connectionString: process.env.DATABASE_URL,
});


// ================================
// กำหนด Port ของเซิร์ฟเวอร์
// ================================
const port = process.env.PORT || 3000;


// ================================
// สร้าง HTTP Server
// ================================
const server = http.createServer(async (req, res) => {

    // กำหนดสถานะและชนิดข้อมูลที่ส่งกลับ
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    try {

        // ================================
        // เชื่อมต่อฐานข้อมูล
        // ================================
        const client = await pool.connect();

        // ดึงข้อมูลทั้งหมดจากตาราง students
        const result = await client.query(
            "SELECT * FROM students"
        );

        // คืนการเชื่อมต่อกลับสู่ Pool
        client.release();


        // ================================
        // สร้างหน้า HTML
        // ================================
        let html = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <title>ฐานข้อมูลนักศึกษา</title>

            <style>
                body{
                    font-family: Arial, sans-serif;
                    background:#f4f6f9;
                    margin:40px;
                }

                h1{
                    color:#0066cc;
                    text-align:center;
                }

                table{
                    width:70%;
                    margin:auto;
                    border-collapse:collapse;
                    background:white;
                    box-shadow:0 0 10px rgba(0,0,0,.15);
                }

                th{
                    background:#0066cc;
                    color:white;
                    padding:12px;
                }

                td{
                    padding:10px;
                    text-align:center;
                }

                tr:nth-child(even){
                    background:#f2f2f2;
                }

                tr:hover{
                    background:#d9ecff;
                }
            </style>

        </head>

        <body>

            <h1>📚 ฐานข้อมูลนักศึกษา</h1>

            <table>
                <tr>
                    <th>รหัสนักศึกษา</th>
                    <th>ชื่อ - นามสกุล</th>
                </tr>
        `;

        // ================================
        // แสดงข้อมูลนักศึกษา
        // ================================
        result.rows.forEach((row) => {
            html += `
                <tr>
                    <td>${row.students_id}</td>
                    <td>${row.students_name}</td>
                </tr>
            `;
        });

        html += `
            </table>

        </body>
        </html>
        `;

        // ส่ง HTML กลับไปยัง Browser
        res.end(html);

    } catch (err) {

        // ================================
        // กรณีเกิดข้อผิดพลาด
        // ================================
        console.error(err);

        res.end(`
            <h1 style="color:red;">
                ❌ เกิดข้อผิดพลาด
            </h1>

            <p>${err.message}</p>
        `);
    }
});


// ================================
// เริ่มต้นการทำงานของ Server
// ================================
server.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
