// Provide a global logout function used by multiple pages
window.logout = function () {
	// clear session/auth data and navigate to login page
	try { localStorage.clear(); } catch (e) { /* ignore */ }
	window.location.replace('index.html');
};
