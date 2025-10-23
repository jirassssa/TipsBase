# Bot Invite Links

## Discord Bot Invite

### Method 1: Generate Invite Link

Your Discord Client ID: `1429824670823092377`

**Standard Invite Link (Recommended):**
```
https://discord.com/api/oauth2/authorize?client_id=1429824670823092377&permissions=2147485696&scope=bot%20applications.commands
```

**Permissions included:**
- Send Messages
- Embed Links
- Read Message History
- Use Slash Commands
- Send Messages in Threads
- Add Reactions

### Method 2: Admin Invite Link (All Permissions)
```
https://discord.com/api/oauth2/authorize?client_id=1429824670823092377&permissions=8&scope=bot%20applications.commands
```

### วิธีเชิญบอทเข้า Discord Server:

1. **คัดลอกลิงก์ด้านบน** (แนะนำใช้ Standard Invite Link)

2. **เปิดลิงก์ในเบราว์เซอร์**

3. **เลือก Server** ที่ต้องการเพิ่มบอท
   - คุณต้องมีสิทธิ์ "Manage Server" ใน server นั้น

4. **คลิก "Continue"**

5. **เลือก Permissions** ที่ต้องการให้บอท
   - แนะนำให้เลือกทุกอย่างที่ขอมา

6. **คลิก "Authorize"**

7. **ยืนยันว่าคุณไม่ใช่หุ่นยนต์** (CAPTCHA)

8. **เสร็จสิ้น!** บอทจะเข้า server แล้ว

---

## Telegram Bot

### Find Bot:

**Bot Username:** คุณต้องหา username ของ bot จาก BotFather

### วิธีหา Bot Username:

1. เปิด Telegram
2. ค้นหา **@BotFather**
3. พิมพ์ `/mybots`
4. เลือก bot ของคุณ
5. ดูที่ **Username** หรือ **t.me/your_bot_name**

### วิธีเพิ่มบอทเข้ากลุ่ม Telegram:

1. **เปิดกลุ่ม Telegram**

2. **คลิกชื่อกลุ่ม** (ด้านบน)

3. **คลิก "Add Members"**

4. **ค้นหา bot** (@your_bot_username)

5. **คลิกเพื่อเพิ่ม**

6. **ให้สิทธิ์ Admin** (ถ้าต้องการให้บอทอ่านข้อความทั้งหมด):
   - Edit Administrators
   - เพิ่มบอทเป็น Admin
   - เปิดสิทธิ์ "Delete Messages" และ "Ban Users" (ถ้าต้องการ)

---

## Quick Test After Invite

### Discord:
```
/balance
```
ควรแสดงยอดเงินของคุณ (0 ETH ถ้ายังไม่ได้ฝาก)

### Telegram:
```
/start
```
ควรแสดงข้อความต้อนรับพร้อมคำสั่งทั้งหมด

---

## Bot Information

**Discord Bot:**
- Client ID: 1429824670823092377
- Name: Base Tip Bot#9454
- Status: ✅ Online
- Contract: 0x6B21dDC3B71a892196B8d70e69e60866d71DeF7a

**Telegram Bot:**
- Token: (See .env file)
- Status: ⚠️ Running (need to test)

---

## Troubleshooting

### Discord Bot ไม่ออนไลน์:
- เช็คว่า process ยังทำงานอยู่
- Restart bot: `npm run bot:discord`

### Telegram Bot ไม่ตอบ:
- เช็คว่า bot token ถูกต้อง
- ลองส่ง `/start` ใหม่
- Restart bot: `npm run bot`

### Slash Commands ไม่แสดง:
- รอ 1-5 นาที (Discord ต้อง sync commands)
- Kick bot แล้วเชิญใหม่
- Re-register commands: restart Discord bot

---

## Next Steps

1. ✅ เชิญบอทเข้า server/group
2. ✅ ทดสอบคำสั่งพื้นฐาน (`/balance`, `/start`)
3. ✅ ฝากเงินผ่าน Web Dashboard (http://localhost:3001)
4. ✅ ทดสอบการ tip ระหว่างผู้ใช้
5. ✅ ตรวจสอบ fee ที่ส่งไปยัง owner wallet

Happy Tipping! 💰
