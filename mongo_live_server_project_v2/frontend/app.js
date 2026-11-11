const postsContainer = document.getElementById("posts");
const usersContainer = document.getElementById("users");
const postForm = document.getElementById("postForm");
const message = document.getElementById("message");
const createdBySelect = document.getElementById("createdBy");

// GET: retrieve all posts and display author details returned by populate().
document.getElementById("loadPosts").addEventListener("click", loadPosts);
async function loadPosts() {
  postsContainer.textContent = "Loading posts...";
  try {
    const response = await fetch("/api/v1/posts/getPosts");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json();
    postsContainer.replaceChildren();
    if (posts.length === 0) {
      postsContainer.textContent = "No posts found.";
      return;
    }

    posts.forEach((post) => {
      const item = document.createElement("article");
      item.className = "record";
      const author = post.createdBy?.username ?? "Unknown author";
      const details = document.createElement("p");
      details.textContent = `${post.name} – ${post.description} (Age: ${post.age}) – Created by: ${author}`;

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.className = "small-button secondary";
      editButton.addEventListener("click", async () => {
        const newDescription = prompt("Enter the new description:", post.description);
        if (newDescription === null || !newDescription.trim()) return;
        try {
          const updateResponse = await fetch(`/api/v1/posts/update/${post._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: newDescription.trim() })
          });
          if (!updateResponse.ok) throw new Error("Edit failed");
          await loadPosts();
        } catch (error) {
          alert(error.message);
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.className = "small-button danger";
      deleteButton.addEventListener("click", async () => {
        if (!confirm(`Delete the post '${post.name}'?`)) return;
        try {
          const deleteResponse = await fetch(`/api/v1/posts/delete/${post._id}`, { method: "DELETE" });
          if (!deleteResponse.ok) throw new Error("Delete failed");
          await loadPosts();
        } catch (error) {
          alert(error.message);
        }
      });

      item.append(details, editButton, deleteButton);
      postsContainer.appendChild(item);
    });
  } catch (error) {
    postsContainer.textContent = "Could not load posts.";
    console.error(error);
  }
}

// GET: retrieve users without exposing their password hashes.
document.getElementById("loadUsers").addEventListener("click", loadUsers);
async function loadUsers() {
  usersContainer.textContent = "Loading users...";
  try {
    const response = await fetch("/api/v1/users/getUsers");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const users = await response.json();
    usersContainer.replaceChildren();
    if (users.length === 0) {
      usersContainer.textContent = "No users found.";
      return;
    }
    users.forEach((user) => {
      const item = document.createElement("p");
      item.textContent = `${user.username} (Email: ${user.email})`;
      usersContainer.appendChild(item);
    });
    populateUserOptions(users);
  } catch (error) {
    usersContainer.textContent = "Could not load users.";
    console.error(error);
  }
}

function populateUserOptions(users) {
  createdBySelect.replaceChildren(new Option("No user selected", ""));
  users.forEach((user) => {
    createdBySelect.add(new Option(user.username, user._id));
  });
}

async function loadUserOptions() {
  try {
    const response = await fetch("/api/v1/users/getUsers");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    populateUserOptions(await response.json());
  } catch (error) {
    console.error("Could not load user options:", error);
  }
}

// POST: send the HTML form values as JSON to the Express API.
postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const post = {
    name: document.getElementById("name").value.trim(),
    description: document.getElementById("description").value.trim(),
    age: Number(document.getElementById("age").value),
    createdBy: createdBySelect.value || undefined
  };
  try {
    const response = await fetch("/api/v1/posts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to create post");
    message.textContent = "Post created successfully!";
    postForm.reset();
    await loadPosts();
  } catch (error) {
    message.textContent = error.message;
  }
});

// POST: register a user. The backend hashes the password before storing it.
document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const userMessage = document.getElementById("userMessage");
  const user = {
    username: document.getElementById("username").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  };
  try {
    const response = await fetch("/api/v1/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Registration failed");
    userMessage.textContent = "User registered successfully!";
    event.target.reset();
    await loadUsers();
  } catch (error) {
    userMessage.textContent = error.message;
  }
});

loadUserOptions();
