const ClientService = require("../services/client.service");
const CommunityService = require("../services/community.service");
const PostService = require("../services/post.service");
const CommentService = require("../services/comment.service");
const AuthService = require("../services/auth.service");
const PostRepository = require("../repositories/post.repository");
const CommentRepository = require("../repositories/comment.repository");

/**
 * Reads query-string feedback params set after a redirect.
 * @param {import('express').Request} req
 * @returns {{ message: string|null, messageType: string }}
 */
function buildFeedbackState(req) {
    return {
        message: req.query.message || null,
        messageType: req.query.type === "error" ? "error" : "success",
    };
}

/**
 * Builds a redirect path with feedback encoded as query params.
 * @param {string} basePath
 * @param {string} message
 * @param {string} [type]
 * @returns {string}
 */
function buildRedirectPath(basePath, message, type = "success") {
    const params = new URLSearchParams({ message, type });
    return `${basePath}?${params.toString()}`;
}

/**
 * @class ViewController
 *
 * Handles all EJS server-side rendered page requests.
 */
class ViewController {

    // Dashboard
    /**
     * GET /
     * Renders the dashboard with live summary counts.
     *
     * @param {import('express').Request}  req
     * @param {import('express').Response} res
     */
    static async renderHome(req, res) {
        try {
            const [clients, communities, posts] = await Promise.all([
                ClientService.getAllClients(),
                CommunityService.getAllCommunities(),
                PostService.getAllPosts(),
            ]);
            const totalComments = posts.reduce((sum, p) => sum + (p.commentCount || 0), 0);
            return res.render("index", {
                title: "Dashboard - Acta",
                summary: {
                    clients: clients.length,
                    communities: communities.length,
                    posts: posts.length,
                    comments: totalComments,
                },
                error: null,
            });
        } catch (err) {
            return res.status(500).render("index", {
                title: "Dashboard - Acta",
                summary: { clients: 0, communities: 0, posts: 0, comments: 0 },
                error: err.message,
            });
        }
    }

    // Clients

    /**
     * GET /clients
     * Renders the clients page with all registered users and a create form.
     *
     * @param {import('express').Request}  req
     * @param {import('express').Response} res
     */
    static async renderClients(req, res) {
        try {
            const clients = await ClientService.getAllClients();
            return res.render("clients", {
                title: "Clients - Acta",
                clients,
                error: null,
                ...buildFeedbackState(req),
            });
        } catch (err) {
            return res.status(500).render("clients", {
                title: "Clients - Acta",
                clients: [],
                error: err.message,
                ...buildFeedbackState(req),
            });
        }
    }

    /**
     * POST /clients
     * Registers a new client using AuthService.register.
     * Form fields: username, email, password.
     *
     * @param {import('express').Request}  req - Body: { username, email, password }.
     * @param {import('express').Response} res
     */
    static async createClient(req, res) {
        try {
            await AuthService.register(req.body);
            return res.redirect(
                buildRedirectPath("/clients", "Client created successfully.")
            );
        } catch (err) {
            return res.redirect(buildRedirectPath("/clients", err.message, "error"));
        }
    }

    // Communities
    /**
     * GET /communities
     * Renders the communities page. Also loads all clients for the
     * dropdown on the create form and join buttons.
     *
     * @param {import('express').Request}  req
     * @param {import('express').Response} res
     */
    static async renderCommunities(req, res) {
        try {
            const [communities, clients] = await Promise.all([
                CommunityService.getAllCommunities(),
                ClientService.getAllClients(),
            ]);
            return res.render("communities", {
                title: "Communities - Acta",
                communities,
                clients,
                error: null,
                ...buildFeedbackState(req),
            });
        } catch (err) {
            return res.status(500).render("communities", {
                title: "Communities - Acta",
                communities: [],
                clients: [],
                error: err.message,
                ...buildFeedbackState(req),
            });
        }
    }

    /**
     * POST /communities
     * Creates a new community. The creator is selected from the dropdown.
     * Form fields: name, description, creatorId.
     *
     * @param {import('express').Request}  req - Body: { name, description, creatorId }.
     * @param {import('express').Response} res
     */
    static async createCommunity(req, res) {
        try {
            const { name, description, creatorId } = req.body;
            await CommunityService.createCommunity({ name, description }, creatorId);
            return res.redirect(
                buildRedirectPath("/communities", `Community ${name} created successfully.`)
            );
        } catch (err) {
            return res.redirect(buildRedirectPath("/communities", err.message, "error"));
        }
    }

    /**
     * POST /communities/:id/join
     * Joins a community on behalf of the selected client.
     * Form fields: clientId.
     *
     * @param {import('express').Request}  req - Params: { id }. Body: { clientId }.
     * @param {import('express').Response} res
     */
    static async joinCommunity(req, res) {
        try {
            await CommunityService.joinCommunity(req.params.id, req.body.clientId);
            return res.redirect(buildRedirectPath("/communities", "Joined community successfully."));
        } catch (err) {
            return res.redirect(buildRedirectPath("/communities", err.message, "error"));
        }
    }

    // Posts

    /**
     * GET /posts
     * Renders the posts page. Also loads all clients and communities
     * for the create form dropdowns.
     *
     * @param {import('express').Request}  req
     * @param {import('express').Response} res
     */
    static async renderPosts(req, res) {
        try {
            const [posts, clients, communities] = await Promise.all([
                PostService.getAllPosts(),
                ClientService.getAllClients(),
                CommunityService.getAllCommunities(),
            ]);
            return res.render("posts", {
                title: "Posts - Acta",
                posts,
                clients,
                communities,
                error: null,
                ...buildFeedbackState(req),
            });
        } catch (err) {
            return res.status(500).render("posts", {
                title: "Posts - Acta",
                posts: [],
                clients: [],
                communities: [],
                error: err.message,
                ...buildFeedbackState(req),
            });
        }
    }

    /**
     * POST /posts
     * Creates a new post. Author and community are selected from dropdowns.
     * Form fields: title, content, communityId, clientId.
     *
     * @param {import('express').Request}  req - Body: { title, content, communityId, clientId }.
     * @param {import('express').Response} res
     */
    static async createPost(req, res) {
        try {
            const { title, content, communityId, clientId } = req.body;
            await PostService.createPost(
                { title, content, communityId: Number(communityId) },
                clientId
            );
            return res.redirect(buildRedirectPath("/posts", "Post created successfully."));
        } catch (err) {
            return res.redirect(buildRedirectPath("/posts", err.message, "error"));
        }
    }

    /**
     * POST /posts/:id/upvote
     * Increments the post's vote_count by 1.
     *
     * @param {import('express').Request}  req - Params: { id }.
     * @param {import('express').Response} res
     */
    static async upvotePost(req, res) {
        try {
            await PostRepository.upvote(req.params.id);
            return res.redirect(buildRedirectPath("/posts", "Vote added."));
        } catch (err) {
            return res.redirect(buildRedirectPath("/posts", err.message, "error"));
        }
    }

    /**
     * POST /posts/:id/downvote
     * Decrements the post's vote_count by 1.
     *
     * @param {import('express').Request}  req - Params: { id }.
     * @param {import('express').Response} res
     */
    static async downvotePost(req, res) {
        try {
            await PostRepository.downvote(req.params.id);
            return res.redirect(buildRedirectPath("/posts", "Vote added."));
        } catch (err) {
            return res.redirect(buildRedirectPath("/posts", err.message, "error"));
        }
    }

    // Comments

    /**
     * GET /posts/:postId/comments
     * Renders the comments page for a specific post.
     * Also loads all clients for the dropdown on the create form.
     *
     * @param {import('express').Request}  req - Params: { postId }.
     * @param {import('express').Response} res
     */
    static async renderComments(req, res) {
        try {
            const { postId } = req.params;
            const [post, comments, clients] = await Promise.all([
                PostService.getPostById(postId),
                CommentService.getCommentsByPost(postId),
                ClientService.getAllClients(),
            ]);
            return res.render("comments", {
                title: `Comments — ${post.title}`,
                post,
                comments,
                clients,
                error: null,
                ...buildFeedbackState(req),
            });
        } catch (err) {
            return res.status(500).render("comments", {
                title: "Comments - Acta",
                post: null,
                comments: [],
                clients: [],
                error: err.message,
                ...buildFeedbackState(req),
            });
        }
    }

    /**
     * POST /posts/:postId/comments
     * Creates a comment or reply. Author is selected from the dropdown.
     * Form fields: content, clientId, parentCommentId (optional).
     *
     * @param {import('express').Request}  req - Params: { postId }. Body: { content, clientId, parentCommentId? }.
     * @param {import('express').Response} res
     */
    static async createComment(req, res) {
        const { postId } = req.params;
        try {
            const { content, clientId, parentCommentId } = req.body;
            await CommentService.createComment(
                {
                    content,
                    postId: Number(postId),
                    parentCommentId: parentCommentId ? Number(parentCommentId) : null,
                },
                clientId
            );
            return res.redirect(
                buildRedirectPath(`/posts/${postId}/comments`, "Comment posted successfully.")
            );
        } catch (err) {
            return res.redirect(
                buildRedirectPath(`/posts/${postId}/comments`, err.message, "error")
            );
        }
    }

    /**
     * POST /comments/:id/upvote
     * Increments a comment's vote_count by 1.
     *
     * @param {import('express').Request}  req - Params: { id }.
     * @param {import('express').Response} res
     */
    static async upvoteComment(req, res) {
        try {
            await CommentRepository.upvote(req.params.id);
            return res.redirect(req.get("Referer") || "/posts");
        } catch (err) {
            return res.redirect(buildRedirectPath("/posts", err.message, "error"));
        }
    }

    /**
     * POST /comments/:id/downvote
     * Decrements a comment's vote_count by 1.
     *
     * @param {import('express').Request}  req - Params: { id }.
     * @param {import('express').Response} res
     */
    static async downvoteComment(req, res) {
        try {
            await CommentRepository.downvote(req.params.id);
            return res.redirect(req.get("Referer") || "/posts");
        } catch (err) {
            return res.redirect(buildRedirectPath("/posts", err.message, "error"));
        }
    }
}

module.exports = ViewController;