import { FirestoreService } from './firestore';

// Actions that should go to the Gmail service
const MAIL_ACTIONS = ['get_inbox', 'send_email', 'send_welcome_email'];

const HARDCODED_GAS_URL = "";

// We fetch the URLs dynamically from Firestore
const getApiUrl = async (action) => {
    try {
        const config = await FirestoreService.getGasConfig();

        if (MAIL_ACTIONS.includes(action)) {
            return config.gas_url_mail || config.gas_url_features || config.gas_url || HARDCODED_GAS_URL;
        }

        return config.gas_url_features || config.gas_url || HARDCODED_GAS_URL;
    } catch (e) {
        console.warn("Firestore config fetch failed, using fallback URL if available:", e);
        return HARDCODED_GAS_URL;
    }
};

export const GAS_API = {
    // POST actions
    async post(action, payload, overrideUrl = null) {
        const url = overrideUrl || await getApiUrl(action);
        if (!url) throw new Error("Backend URL not configured");

        const response = await fetch(url, {
            method: "POST",
            mode: "cors", // Explicitly set cors
            redirect: "follow", // Ensure redirects are followed (GAS behavior)
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify({ action, payload })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'error') {
            throw new Error(data.message || 'Unknown backend error');
        }
        return data.data;
    },

    // GET actions
    async get(action, params = {}) {
        let url = await getApiUrl(action);
        if (!url) throw new Error("Backend URL not configured");

        const queryString = new URLSearchParams({ action, ...params }).toString();
        const response = await fetch(`${url}?${queryString}`);

        return await response.json();
    },

    // Wrappers
    async registerEvent(data) {
        return this.post('register_event', data);
    },

    async sendEmail(to, subject, htmlBody, cc = '', bcc = '', attachments = []) {
        return this.post('send_email', { to, subject, htmlBody, cc, bcc, attachments });
    },

    async sendWelcomeEmail(email, name) {
        return this.post('send_welcome_email', { email, name });
    },

    async uploadFile(file, folderType) {
        // Fetch config to get dynamic Folder IDs
        let folderId = null;
        try {
            const config = await FirestoreService.getGasConfig();
            if (folderType === 'events') folderId = config.folder_id_events;
            else if (folderType === 'papers') folderId = config.folder_id_papers;
            else if (folderType === 'certificates') folderId = config.folder_id_certificates;
            else if (folderType === 'avatars') folderId = config.folder_id_avatars;
            else if (folderType === 'blogs') folderId = config.folder_id_blogs;
            else if (folderType === 'panel') folderId = config.folder_id_panel;
        } catch (e) {
            console.warn("Failed to fetch folder ID from config, relying on backend defaults:", e);
        }

        // Convert file to Base64
        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });

        const base64Data = await toBase64(file);

        return this.post('upload_file', {
            name: file.name,
            mimeType: file.type,
            data: base64Data,
            folderType,
            // Ensure we strictly extract just the ID if a URL is provided (defensive coding)
            folderId: folderId ? (folderId.match(/folders\/([-\w]{25,})|([-\w]{25,})/)?.[1] || folderId.match(/folders\/([-\w]{25,})|([-\w]{25,})/)?.[2] || folderId) : null
        });
    },

    async listFiles(folderId) {
        return this.post('list_files', { folderId });
    },

    async deleteFile(fileId) {
        return this.post('delete_file', { fileId });
    },

    async getInbox(count = 20) {
        return this.post('get_inbox', { count });
    },

    async saveBlogContent(blogId, blogData) {
        return this.post('save_blog_content', { blogId, ...blogData });
    },

    async getBlogContent(blogId) {
        return this.post('get_blog_content', { blogId });
    },

    async getBlogs() {
        return this.post('get_blog_list', {});
    },

    async deleteBlogContent(blogId) {
        return this.post('delete_blog_content', { blogId });
    }
};
