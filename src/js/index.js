const img = new Image();
const Chat = function () {
	function Chat () {
		this.socket = null;
		this.init();
	}
	const cache = {
			del: function (id) {
				if (currentUser.ele === id) {
					currentUser.ele = cache["group"].user;
				}
				userEle.get(0).removeChild(cache[id].user.get(0));
				msgArea.removeChild(cache[id].ele.get(0));
				delete cache[id];
			}
		}, myself = "我", toPClass = "to-private";
	var p = Chat.prototype,
		cacheDiv = document.createElement("div"),
		info, peopel, msgArea, nickname, append, userEle,
		currentUser = {}, cacheName,
		login = false;
	p.init = function () {
		this.socket = io.connect();
		// 监听connect事件(表示连接已经建立)
		this.socket.on("connect", () => {
			L(".loading").hide();
			L(".enter-name").show();	
			initDom.call(this);			
			this.login();
			this.system();
			this.newmsg();
		});
	};
	p.login = function () {
		// 对昵称进行判断
		L("#send-name").click(() => {
			cacheName = nickname.val();
			if (cacheName.trim()) {
				this.socket.emit("login", cacheName);
			} else {
				info.text("your nickname can't be blank or just spaces");
			}
		});
		this.socket.on("loginSuccess", () => {
			login = true;
			L("#mask").hide();
		});
		this.socket.on("repeat", () => {
			info.text("your nickname is token, please use another");
		});
	};
	p.system = function () {
		this.socket.on("system", (data) => {
			if (login) {
				updateUser(data);
			}
		});
	};
	p.newmsg = function () {
		this.socket.on("newmsg", (nickname, message) => {
			otherMsg(nickname, message);
		});
	};
	p.initSend = function () {
		L("#send").click(() => {
			const ele = L("#msg-input"),
				message = ele.val();
			if (message.trim()) {
				ele.val("");
				meMsg(message);
				this.socket.emit("postmsg", message);
			}
			ele.get(0).focus();
		});
	};
	function updateUser (data) {
		peopel.text(data.size);
		if (data.flag) {
			append(`<div class="user-in">
				欢迎
				<img class="user-img ${toPClass}" alt="${data.nickname === cacheName ? myself : data.nickname}" src="images/face.jpeg" />
				<strong class="user-name">${data.nickname}</strong> 
				加入群聊！
			</div>`);
		} else { 
			otherMsg("system", `用户 ${data.nickname} 已经离开群聊`)
		}
	}
	function BaseMsg (user, message, me) {
		me = me ? "me-" : "";
		const html = `<div class="${me}chat-info">
			<img class="user-normal-img ${toPClass}" alt="${user}" src="images/face.jpeg" />
			<span class="time">
				<strong class="user-name">${user}</strong> 
				${formatDate()}
			</span>
			<span class="${me}message">
				${message}
			</span>
		</div>`;
		append(html);
	}
	function otherMsg (user, message) {
		BaseMsg(user, message, false);
	}
	function meMsg (message) {
		BaseMsg(myself, message, true);
	}
	function initDom () {
		var user = L(".active"), 
			msgBox = L(".show");
		info = L(".info");
		peopel = L("#peopel");
		msgArea = L("#msg-area").get(0);
		nickname = L("#nickname");
		userEle = L("#users");
		cache["group"] = {
			user: user,
			ele: msgBox
		};
		msgBox.show();
		Object.defineProperty(currentUser, "ele", {
			get: () => {
				return user.data("id");
			},
			set: (val) => {
				const id = val.data("id");
				user.removeClass("active");
				val.addClass("active");
				msgBox.removeClass("show");
				if (cache[id]) {
					msgBox = cache[id]["ele"];
					msgBox.addClass("show");
				} else {
					const dom = createMsgBox(id);
					msgArea.appendChild(dom.get(0));
					msgBox = dom;
					cache[id] = {
						user: val,
						ele: msgBox
					};
				}
				user = val;
			}
		});
		nickname.get(0).focus();
		BindUserClick();
		BindImgClick();
		append = MsgAppend(cache["group"].ele);
		this.initSend();
	}
	function createMsgBox (id) {
		return L(`<div class="msg show" data-id=${id}>
				<p class="attention">与${id}私聊中</p>
			</div>`);
	}
	function createUserBox (id) {
		return L(`<li class="user" data-id="${id}">
				<img class="user-img-style", src="images/face.jpeg" />
				${id}
				<span class="count">0</span>
				<span class="close">╳</span>
			</li>`);
	}
	function BindImgClick () {
		L("#group").click((e) => {
			var cur = e.target;
			if (~cur.className.indexOf(toPClass) && cur.alt !== "我") {
				const id = cur.alt;
				if (!cache[id]) {
					const dom = createUserBox(id);
					userEle.get(0).appendChild(dom.get(0));
					currentUser.ele = dom;
				}
				currentUser.ele = cache[id].user;
			}
		});
	}
	function BindUserClick () {
		userEle.click((e) => {
			var cur = e.target;
			if (cur.className === "close") {
				release(cur);
				return void 0;
			}
			while (cur.tagName !== "LI") {
				cur = cur.parentNode;
			}
			currentUser.ele = L(cur);
		});
	}
	function release (dom) {
		dom = dom.parentNode;
		cache.del(dom.getAttribute("data-id"));
	}
	function getDom (html) {
		cacheDiv.innerHTML = html;
		return cacheDiv.childNodes[0];
	}
	function MsgAppend (ldom) {
		const ele = ldom.get(0);
		return function (html) {
			ele.appendChild(getDom(html));
			ele.scrollTop = ele.scrollHeight;
		};
	}
	function formatDate () {
		const date = new Date();
		return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}  ${date.getHours()}:${fillTo(date.getMinutes())}:${fillTo(date.getSeconds())}`;
	}
	function fillTo (str) {
		return String(str).length < 2 ? `0${str}` : str;
	}
	return Chat;
}();
// 页面加载完成初始化Chat
L(window).load(() => {
	new Chat();
	// loading headimg
	img.src = "images/face.jpeg";
	img.onerror = function () {
		this.src = "images/logo.png";
	};
});