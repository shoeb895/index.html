document.addEventListener("DOMContentLoaded", function () {
    
    // ==========================================
    // 1. HOMEPAGE LOGIC (index.html)
    // ==========================================
    const matchesContainer = document.getElementById('matchesContainer');
    if (matchesContainer) {
        let matches = JSON.parse(localStorage.getItem('ff_matches')) || [];
        matchesContainer.innerHTML = ''; 
        
        if (matches.length === 0) {
            matchesContainer.innerHTML = '<p style="text-align:center; width:100%; color: #888;">Koi match abhi available nahi hai. Admin jald hi add karenge.</p>';
        } else {
            matches.forEach(match => {
                const totalSlots = parseInt(match.slots) || 0;
                const joinedSlots = parseInt(match.joined) || 0;
                let percentage = totalSlots > 0 ? (joinedSlots / totalSlots) * 100 : 0;
                const isFull = joinedSlots >= totalSlots;
                const barColorClass = isFull ? 'full' : '';
                const btnHTML = isFull 
                    ? `<button class="btn disabled">Match Full 🚫</button>` 
                    : `<a href="register.html?matchId=${match.id}&matchName=${encodeURIComponent(match.title)}" class="btn">Join Now</a>`;

                const matchBox = `
                    <div class="match-card">
                        <h3>${match.title}</h3>
                        <p><strong>🕒 Time:</strong> <span>${match.time}</span></p>
                        <p><strong>🗺️ Map:</strong> <span>${match.map}</span></p>
                        <p><strong>💰 Entry Fee:</strong> <span>₹${match.fee}</span></p>
                        <p style="color: #4CAF50; border:none;"><strong>🏆 Prize:</strong> <span>₹${match.prize}</span></p>
                        
                        <div class="progress-container">
                            <div class="progress-bar ${barColorClass}" style="width: ${percentage}%"></div>
                        </div>
                        <span class="slots-text">Spots Filled: ${joinedSlots} / ${totalSlots}</span>
                        ${btnHTML}
                    </div>
                `;
                matchesContainer.innerHTML += matchBox;
            });
        }
    }

    // ==========================================
    // 2. ADMIN LOGIN LOGIC (login.html)
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const pass = document.getElementById('adminPassword').value;
            if (pass === "admin123") { // Yahan password change kar sakte hain
                localStorage.setItem("isAdminAuth", "true");
                window.location.href = "admin.html";
            } else {
                document.getElementById('errorMsg').style.display = "block";
            }
        });
    }

    // ==========================================
    // 3. ADMIN PANEL LOGIC (admin.html)
    // ==========================================
    const addMatchForm = document.getElementById('addMatchForm');
    const adminMatchesList = document.getElementById('adminMatchesList');
    
    if (addMatchForm) {
        if (localStorage.getItem("isAdminAuth") !== "true") {
            window.location.href = "login.html";
        }

        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem("isAdminAuth");
            window.location.href = "login.html";
        });

        // Match load karna (Delete karne ke liye)
        function loadAdminMatches() {
            let matches = JSON.parse(localStorage.getItem('ff_matches')) || [];
            adminMatchesList.innerHTML = '';
            if(matches.length === 0) {
                adminMatchesList.innerHTML = '<p style="color:#aaa; text-align:center;">No active matches.</p>';
                return;
            }
            matches.forEach(match => {
                adminMatchesList.innerHTML += `
                    <div style="background: #1a1a24; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #333;">
                        <h3 style="color:#ff4500; margin-top:0; font-size: 1.2em;">${match.title}</h3>
                        <p style="color:#ccc; font-size:12px; margin: 5px 0;">Time: ${match.time} | Slots: ${match.joined}/${match.slots}</p>
                        <button onclick="deleteMatch(${match.id})" class="btn" style="background: #e60000; padding: 8px; width: 100%; font-size: 14px; margin-top: 10px;">Delete Match 🗑️</button>
                    </div>
                `;
            });
        }
        loadAdminMatches();

        // Naya Match Add karna
        addMatchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newMatch = {
                id: Date.now(),
                title: document.getElementById('title').value,
                time: document.getElementById('time').value,
                map: document.getElementById('map').value,
                fee: document.getElementById('fee').value,
                prize: document.getElementById('prize').value,
                slots: document.getElementById('slots').value,
                joined: 0
            };
            let matches = JSON.parse(localStorage.getItem('ff_matches')) || [];
            matches.push(newMatch);
            localStorage.setItem('ff_matches', JSON.stringify(matches));
            alert("Match Added Successfully!");
            addMatchForm.reset();
            loadAdminMatches(); // Naya match list me turant dikhane ke liye
        });
    }

    // ==========================================
    // 4. REGISTRATION & WHATSAPP LOGIC (register.html)
    // ==========================================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const matchId = urlParams.get('matchId');
        const matchName = urlParams.get('matchName');

        if (matchName) {
            document.getElementById('selectedMatchName').innerText = "Joining: " + matchName;
        } else {
            alert("Pehle Homepage se ek match select karein!");
            window.location.href = "index.html";
        }

        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Slots Update Karna (+1)
            let matches = JSON.parse(localStorage.getItem('ff_matches')) || [];
            let matchIndex = matches.findIndex(m => m.id == matchId);
            if(matchIndex !== -1) {
                matches[matchIndex].joined = (parseInt(matches[matchIndex].joined) || 0) + 1;
                localStorage.setItem('ff_matches', JSON.stringify(matches));
            }

            // Form ka Data Nikaalna
            const team = document.getElementById('teamName').value;
            const captain = document.getElementById('captainName').value;
            const whatsapp = document.getElementById('whatsapp').value;
            const txnId = document.getElementById('txnId').value;
            
            // ==========================================
            // 🛑 APNA WHATSAPP NUMBER YAHAN DALEIN 🛑
            // ==========================================
            const adminWhatsApp = "917398999392"; // Country code 91 ke sath number likhein (bina + ke)
            
            // WhatsApp message format banana ( %0A = New Line / Enter )
            const waMessage = `🔥 *NEW TEAM ENTRY* 🔥%0A%0A*Match Name:* ${matchName}%0A*Team Name:* ${team}%0A*Captain IGN:* ${captain}%0A*Player WhatsApp:* ${whatsapp}%0A*UPI Txn ID:* ${txnId}%0A%0A_Please verify payment & share Room ID._`;
            
            const waLink = `https://wa.me/${adminWhatsApp}?text=${waMessage}`;

            // Success Screen
            document.body.innerHTML = `
                <div style="background-color: #050505; color: white; height: 100vh; text-align: center; padding-top: 100px; font-family: 'Poppins', sans-serif;">
                    <h1 style="color: #4CAF50; font-size: 3em;">BOOYAH! 🎉</h1>
                    <h2 style="color: #ff4500; margin: 20px 0;">${team.toUpperCase()} is Registered!</h2>
                    <p style="color: #ccc;">Aapki details admin ko WhatsApp par bhej di gayi hain.</p>
                    <p style="color: #ccc; margin-top: 10px;">Verify hote hi Room ID mil jayegi.</p>
                    <br><br>
                    <a href="index.html" class="btn" style="width: auto; padding: 15px 40px; display: inline-block;">BACK TO HOME</a>
                </div>
            `;

            // Khiladi ko automatically WhatsApp par bhejna (Naye tab me)
            window.open(waLink, '_blank');
        });
    }
});

// Global Function: Delete Match
window.deleteMatch = function(id) {
    if(confirm("Kkya aap waqai is match ko delete karna chahte hain?")) {
        let matches = JSON.parse(localStorage.getItem('ff_matches')) || [];
        matches = matches.filter(m => m.id != id);
        localStorage.setItem('ff_matches', JSON.stringify(matches));
        alert("Match Deleted!");
        window.location.reload(); // Page refresh to update list
    }
};