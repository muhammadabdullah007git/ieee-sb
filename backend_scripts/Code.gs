// --- Google Apps Script Backend (Code.gs) ---
// Copy this content into your Google Apps Script editor (script.google.com).

// --- CONFIGURATION ---
// Replace these with your actual Folder IDs from Google Drive
const FOLDER_ID_EVENTS = "YOUR_DRIVE_FOLDER_ID_FOR_EVENTS";
const FOLDER_ID_PAPERS = "YOUR_DRIVE_FOLDER_ID_FOR_PAPERS";
const FOLDER_ID_CERTIFICATES = "YOUR_DRIVE_FOLDER_ID_FOR_CERTIFICATES";
const FOLDER_ID_BLOGS = "YOUR_DRIVE_FOLDER_ID_FOR_BLOGS";
const FOLDER_ID_PANEL = "YOUR_DRIVE_FOLDER_ID_FOR_PANEL";
const FOLDER_ID_USERS = "YOUR_DRIVE_FOLDER_ID_FOR_USERS";
const ADMIN_EMAIL = "contact@example.com"; 

// --- DO POST HANDLER ---
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    let result = {};

    switch (action) {
      case "register_event":
        result = handleRegistration(data.payload);
        break;
      case "send_email":
        result = handleSendEmail(data.payload);
        break;
      case "send_welcome_email":
        sendWelcomeEmail(data.payload.email, data.payload.name);
        result = { message: "Welcome email sent" };
        break;
      case "list_files":
        result = listFiles(data.payload.folderId);
        break;
      case "get_inbox":
        result = getInboxThreads(data.payload.count || 20);
        break;
      case "upload_file":
        result = handleFileUpload(data.payload);
        break;
      case "delete_file":
        result = handleFileDeletion(data.payload);
        break;
      case "save_blog_content":
        result = saveBlogContent(data.payload);
        break;
      case "get_blog_content":
        result = getBlogContent(data.payload.blogId);
        break;
      case "get_blog_list":
        result = getBlogList();
        break;
      case "delete_blog_content":
        result = deleteBlogContent(data.payload.blogId);
        break;
      default:
        throw new Error("Invalid action: " + action);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ... existing code ...

// 7. Blog Content Management (Hybrid Storage)
function saveBlogContent(payload) {
  const { blogId, title, category, image, author, date, content } = payload;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Blogs");
  
  if (!sheet) {
    sheet = ss.insertSheet("Blogs");
    sheet.appendRow(["Blog ID", "Title", "Category", "Image", "Author", "Date", "Content", "Last Updated"]);
    sheet.setColumnWidth(7, 500); // Make content column wider
  }

  const data = sheet.getDataRange().getValues();
  let foundRow = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === blogId) {
      foundRow = i + 1;
      break;
    }
  }

  const rowData = [blogId, title, category, image, author, date, content, new Date()];

  if (foundRow > -1) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { message: "Blog content saved successfully" };
}

function getBlogList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Blogs");
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const blogs = [];
  
  for (let i = 1; i < data.length; i++) {
    blogs.push({
      id: data[i][0],
      title: data[i][1],
      category: data[i][2],
      image: data[i][3],
      author: data[i][4],
      date: data[i][5],
      // We don't return full content in the list to keep it fast
      excerpt: (data[i][6] || "").substring(0, 150) + "..."
    });
  }
  return blogs;
}

function getBlogContent(blogId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Blogs");
  if (!sheet) return { content: "" };

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === blogId) {
      return { 
        id: data[i][0],
        title: data[i][1],
        category: data[i][2],
        image: data[i][3],
        author: data[i][4],
        date: data[i][5],
        content: data[i][6] 
      };
    }
  }
  return { content: "" };
}

function deleteBlogContent(blogId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Blogs");
  if (!sheet) return { message: "Sheet not found" };

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === blogId) {
      sheet.deleteRow(i + 1);
      return { message: "Blog content deleted" };
    }
  }
  return { message: "Blog content not found" };
}

// --- DO GET HANDLER ---
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === "list_files") {
    const folderType = e.parameter.folder; 
    let folderId = FOLDER_ID_PAPERS;
    if (folderType === "events") folderId = FOLDER_ID_EVENTS;
    if (folderType === "certificates") folderId = FOLDER_ID_CERTIFICATES;
    if (folderType === "blogs") folderId = FOLDER_ID_BLOGS;
    if (folderType === "panel") folderId = FOLDER_ID_PANEL;
    if (folderType === "avatars" || folderType === "users") folderId = FOLDER_ID_USERS;
    
    return ContentService.createTextOutput(JSON.stringify(listFiles(folderId)))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput("IEEE <NAME> Backend Service is Running");
}

// --- SERVICES ---

// 1. Spreadsheet Management
function handleRegistration(payload) {
  const { eventTitle, userName, userEmail, userDetails } = payload;
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Sanitize sheet name
  const sheetName = (eventTitle || "General").substring(0, 30);
  
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["Timestamp", "Name", "Email", "Details"]);
  }

  sheet.appendRow([new Date(), userName, userEmail, JSON.stringify(userDetails)]);
  
  // Send Confirmation Email automatically
  sendConfirmationEmail(userEmail, eventTitle, userName);
  
  return { message: "Registration successful" };
}

// 2. Email Service
function handleSendEmail(payload) {
  const { to, subject, htmlBody, cc, bcc, attachments } = payload;
  
  const options = {
    htmlBody: htmlBody
  };

  if (cc) options.cc = cc;
  if (bcc) options.bcc = bcc;
  
  if (attachments && attachments.length > 0) {
    options.attachments = attachments.map(att => {
      const blob = Utilities.newBlob(Utilities.base64Decode(att.data), att.mimeType, att.name);
      return blob;
    });
  }

  MailApp.sendEmail(to, subject, "", options);
  
  return { message: "Email sent successfully" };
}

function sendConfirmationEmail(email, eventTitle, userName) {
  const subject = `Confirmation: Registered for ${eventTitle}`;
  const salutation = userName ? `Dear ${userName},` : "Dear Participant,";
  
  const htmlBody = generateEmailTemplate(
    "Registration Successful",
    `${salutation}<br><br>You have successfully registered for <strong>${eventTitle}</strong>.<br>We look forward to seeing you there!`
  );
  
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}

function sendWelcomeEmail(email, name) {
  const subject = "Welcome to IEEE <NAME> Student Branch";
  const htmlBody = generateEmailTemplate(
    "Welcome to the Community!",
    `Dear ${name},<br><br>
    Your account has been successfully created. We are thrilled to have you as part of the IEEE <NAME> Student Branch family.<br><br>
    Explore our latest events, read our blogs, and connect with fellow members via the dashboard.`,
    true,
    "Go to Dashboard",
    "https://your-website-url.com/admin" // Replace with your actual URL
  );

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}

// --- EMAIL TEMPLATE GENERATOR ---
function generateEmailTemplate(title, bodyContent, showButton = false, buttonText = "", buttonLink = "#") {
  const ieeeBlue = "#00629B";
  const ieeeDark = "#002855";
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; color: #333333; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: ${ieeeBlue}; padding: 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
        .content { padding: 40px 30px; line-height: 1.6; font-size: 16px; color: #444444; }
        .btn-container { text-align: center; margin-top: 30px; margin-bottom: 20px; }
        .btn { display: inline-block; padding: 12px 28px; background-color: ${ieeeBlue}; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.3s; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #8898aa; border-top: 1px solid #eef2f7; }
        .footer a { color: ${ieeeBlue}; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>IEEE <NAME> SB</h1>
        </div>
        <div class="content">
          <h2 style="margin-top: 0; color: ${ieeeDark}; font-size: 20px;">${title}</h2>
          <p>${bodyContent}</p>
          
          ${showButton ? `
            <div class="btn-container">
              <a href="${buttonLink}" class="btn">${buttonText}</a>
            </div>
          ` : ''}
          
          <br>
          <p style="font-size: 14px; color: #666;">Best Regards,<br><strong>IEEE <NAME> Executive Committee</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} IEEE <NAME> Student Branch. All rights reserved.</p>
          <p>Your Institution Address<br>City, Country</p>
          <p><a href="https://your-website-url.com">Visit Website</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 3. Drive Management - Upload
function handleFileUpload(payload) {
  // payload: { name, mimeType, data (base64String), folderType, folderId }
  let folderId = payload.folderId; // Use provided ID if available
  
  if (!folderId) {
    // Fallback to constants based on type
    folderId = FOLDER_ID_PAPERS;
    if (payload.folderType === "events") folderId = FOLDER_ID_EVENTS;
    if (payload.folderType === "certificates") folderId = FOLDER_ID_CERTIFICATES;
    if (payload.folderType === "blogs") folderId = FOLDER_ID_BLOGS;
    if (payload.folderType === "panel") folderId = FOLDER_ID_PANEL;
    if (payload.folderType === "avatars" || payload.folderType === "users") folderId = FOLDER_ID_USERS;
  }

  // VALIDATION: Ensure folderId is valid before using it
  if (!folderId || folderId.includes("YOUR_DRIVE_FOLDER_ID") || folderId.length < 5) {
      throw new Error("Invalid Folder ID configured. Please update Settings or Code.gs with valid Drive Folder IDs.");
  }

  const folder = DriveApp.getFolderById(folderId);
  
  const blob = Utilities.newBlob(Utilities.base64Decode(payload.data), payload.mimeType, payload.name);
  const file = folder.createFile(blob);
  
  // Set to public viewable for certificate links
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return { 
    fileId: file.getId(), 
    url: file.getDownloadUrl(), 
    viewUrl: file.getUrl() 
  };
}

// 4. Drive Management - Deletion
function handleFileDeletion(payload) {
  const file = DriveApp.getFileById(payload.fileId);
  file.setTrashed(true);
  return { message: "File moved to trash" };
}

// 5. Drive Management - List
function listFiles(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  const fileList = [];
  
  while (files.hasNext()) {
    const file = files.next();
    fileList.push({
      id: file.getId(),
      name: file.getName(),
      url: file.getUrl()
    });
  }
  return { files: fileList };
}

// 6. Gmail Inbox Threads
function getInboxThreads(count) {
  console.log("Fetching inbox threads. Count:", count);
  const maxThreads = Number(count) || 20;
  
  try {
    const threads = GmailApp.getInboxThreads(0, maxThreads);
    const resultMessages = [];
    
    for (let i = 0; i < threads.length; i++) {
        const thread = threads[i];
        if (!thread) continue;
        
        const threadMsgs = thread.getMessages();
        if (!threadMsgs || threadMsgs.length === 0) continue;
        
        const lastMsg = threadMsgs[threadMsgs.length - 1];
        
        // Defensive snippet retrieval
        let safeSnippet = "";
        try {
          if (typeof thread.getSnippet === 'function') {
            safeSnippet = thread.getSnippet();
          } else if (lastMsg && typeof lastMsg.getPlainBody === 'function') {
            safeSnippet = lastMsg.getPlainBody().substring(0, 150);
          }
        } catch (e) {
          console.warn("Snippet retrieval failed for thread " + thread.getId());
        }
        
        resultMessages.push({
            id: thread.getId(),
            subject: thread.getFirstMessageSubject() || "(No Subject)",
            from: lastMsg ? lastMsg.getFrom() : "Unknown",
            snippet: safeSnippet,
            timestamp: thread.getLastMessageDate().toISOString(),
            unread: thread.isUnread(),
            count: thread.getMessageCount(),
            isGmail: true
        });
    }
    
    console.log("Successfully fetched " + resultMessages.length + " threads.");
    return { messages: resultMessages };
  } catch (e) {
    console.error("Gmail fetch error:", e);
    throw new Error("Gmail fetch failed: " + e.toString());
  }
}
