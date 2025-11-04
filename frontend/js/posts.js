// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Load posts from API
async function loadPosts() {
    try {
        console.log('📋 Loading posts from API...');
        const response = await fetch(`${API_BASE_URL}/posts`);
        const result = await response.json();
        
        console.log('📊 Posts API Response:', result);
        
        if (result.success) {
            console.log('✅ Successfully loaded posts:', result.data.length);
            displayPosts(result.data);
        } else {
            console.error('❌ Error loading posts:', result.message);
        }
    } catch (error) {
        console.error('❌ Error fetching posts:', error);
    }
}

// Display posts on page
function displayPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    
    if (!postsContainer) {
        console.error('❌ posts-container not found!');
        return;
    }
    
    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = '<div class="col-span-3 text-center py-12"><p class="text-gray-600">Chưa có bài viết nào</p></div>';
        return;
    }
    
    // Show maximum 3 posts on homepage
    const displayPosts = posts.slice(0, 3);
    
    postsContainer.innerHTML = displayPosts.map(post => {
        const excerpt = post.content ? 
            (post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content) : 
            'Đọc thêm để xem nội dung...';
        
        const categoryColors = {
            'Tin tức': 'bg-blue-100 text-blue-800',
            'Khuyến mãi': 'bg-red-100 text-red-800',
            'Hướng dẫn': 'bg-green-100 text-green-800',
            'Chung': 'bg-gray-100 text-gray-800'
        };
        
        const categoryClass = categoryColors[post.category] || categoryColors['Chung'];
        const defaultImage = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600';
        
        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                <!-- Post Image -->
                <div class="relative overflow-hidden h-48">
                    <img src="${post.image_url || defaultImage}" 
                         alt="${post.title}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                         onerror="this.src='${defaultImage}'">
                    <div class="absolute top-4 right-4">
                        <span class="px-3 py-1 ${categoryClass} text-xs font-semibold rounded-full">
                            ${post.category || 'Chung'}
                        </span>
                    </div>
                </div>
                
                <!-- Post Content -->
                <div class="p-6">
                    <!-- Date -->
                    <div class="flex items-center text-sm text-gray-500 mb-3">
                        <i class="fas fa-calendar-alt mr-2"></i>
                        <span>${formatDate(post.created_at)}</span>
                        ${post.author ? `
                            <span class="mx-2">•</span>
                            <i class="fas fa-user mr-2"></i>
                            <span>${post.author}</span>
                        ` : ''}
                    </div>
                    
                    <!-- Title -->
                    <h3 class="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        ${post.title}
                    </h3>
                    
                    <!-- Excerpt -->
                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                        ${excerpt}
                    </p>
                    
                    <!-- Read More Button -->
                    <a href="#" 
                       onclick="viewPostDetail(${post.id}); return false;"
                       class="inline-flex items-center text-primary hover:text-secondary font-semibold text-sm transition-colors">
                        Đọc thêm 
                        <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('✅ Posts displayed successfully');
}

// View post detail (modal)
function viewPostDetail(postId) {
    fetch(`${API_BASE_URL}/posts/${postId}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showPostModal(result.data);
            }
        })
        .catch(error => {
            console.error('Error fetching post detail:', error);
        });
}

// Show post in modal
function showPostModal(post) {
    const defaultImage = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800';
    
    const categoryColors = {
        'Tin tức': 'bg-blue-100 text-blue-800',
        'Khuyến mãi': 'bg-red-100 text-red-800',
        'Hướng dẫn': 'bg-green-100 text-green-800',
        'Chung': 'bg-gray-100 text-gray-800'
    };
    
    const categoryClass = categoryColors[post.category] || categoryColors['Chung'];
    
    const modalHTML = `
        <div id="postModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Close Button -->
                <div class="sticky top-0 bg-white border-b flex justify-end p-4">
                    <button onclick="closePostModal()" class="text-gray-500 hover:text-gray-700 text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Post Content -->
                <div class="p-6 md:p-8">
                    <!-- Category Badge -->
                    <div class="mb-4">
                        <span class="px-3 py-1 ${categoryClass} text-sm font-semibold rounded-full">
                            ${post.category || 'Chung'}
                        </span>
                    </div>
                    
                    <!-- Title -->
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        ${post.title}
                    </h2>
                    
                    <!-- Meta Info -->
                    <div class="flex items-center text-sm text-gray-500 mb-6">
                        <i class="fas fa-calendar-alt mr-2"></i>
                        <span>${formatDate(post.created_at)}</span>
                        ${post.author ? `
                            <span class="mx-2">•</span>
                            <i class="fas fa-user mr-2"></i>
                            <span>${post.author}</span>
                        ` : ''}
                    </div>
                    
                    <!-- Featured Image -->
                    ${post.image_url ? `
                        <div class="mb-6 rounded-xl overflow-hidden">
                            <img src="${post.image_url}" 
                                 alt="${post.title}" 
                                 class="w-full h-auto"
                                 onerror="this.src='${defaultImage}'">
                        </div>
                    ` : ''}
                    
                    <!-- Content -->
                    <div class="prose prose-lg max-w-none">
                        <div class="text-gray-700 leading-relaxed whitespace-pre-line">
                            ${post.content}
                        </div>
                    </div>
                    
                    <!-- Social Share -->
                    <div class="mt-8 pt-6 border-t">
                        <p class="text-sm text-gray-600 mb-3">Chia sẻ bài viết:</p>
                        <div class="flex gap-3">
                            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" 
                               target="_blank"
                               class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                            <a href="https://zalo.me/share" 
                               target="_blank"
                               class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// Close post modal
function closePostModal() {
    const modal = document.getElementById('postModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Make functions global
window.viewPostDetail = viewPostDetail;
window.closePostModal = closePostModal;

// Format date to Vietnamese format
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Auto-load posts when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPosts);
} else {
    loadPosts();
}
