
  "use strict";
  var showDebug = !1, partyId = "cHVzaGJyb3dzZTo6Q2hHNkxuQg==", uiServerUrl = window.location.origin + "/js",
    apiServerUrl = "https://daailynews.com", swScope = window.location.origin + "/js/",
    customWorkerJS = "service-worker.js", pushConfig = {
      trackData: {
        statParams: ["country", "city", "cid"],
        urlParams: ["s1", "s2", "s3", "s4", "ref", "eauuid", "tid"],
        device: ["maker", "model"]
      }, sid: "", urls: {conversion: "", denied: "", success: ""}
    }, messaging = {},
    indexedDBConfig = {baseName: "subscriberData", storeName: "subscriberData", storedDataMap: new Map, version: 2},
    indexedDBFCMConfig = {
      baseName: "fcm_token_details_db",
      storeName: "fcm_token_object_Store",
      storedDataMap: new Map,
      version: 1
    }, pushLoopDomains = {
      domains: ["xyz.daailynews.com", "zyx.daailynews.com", "zxy.daailynews.com", "xzy.daailynews.com", "yzx.daailynews.com", "yxz.daailynews.com"],
      redirectUrl: "http://www.2chat.club/c/20ba79b8886730af?s1=[s1]&s2=no&s4=[s4]&s5=[s5]"
    }, messageBody = {info: {}};

  function logger(e) {
    showDebug && console.log(e)
  }

  var loadScriptAsync = function (e) {
    return new Promise((n, o) => {
      var s = document.createElement("script");
      s.src = e, s.async = !0, s.onload = (() => {
        n()
      });
      var r = document.getElementsByTagName("script")[0];
      r.parentNode.insertBefore(s, r)
    })
  };
  var scriptFirebase = loadScriptAsync("https://www.gstatic.com/firebasejs/5.0.2/firebase-app.js");
  var scriptFirebaseMessaging = loadScriptAsync("https://www.gstatic.com/firebasejs/5.0.2/firebase-messaging.js");

  function defaultIfEmpty(e, n) {
    return void 0 !== e && void 0 !== e && e ? e : n
  }

  function notBlank(e) {
    return null != e && "" != e
  }

  Promise.all([scriptFirebase, scriptFirebaseMessaging]).then(function () {
    function e() {
      pushConfig.urls.conversion = "undefined" != typeof conversionUrl ? conversionUrl : "", pushConfig.urls.denied = "undefined" != typeof deniedUrl ? deniedUrl : "", pushConfig.urls.success = "undefined" != typeof successUrl ? successUrl : "", messageBody["cnavigator.serviceWorker.registerontent"] = window.location.hostname, messageBody.info.browser = getBrowserInfo(), messageBody.browser = getBrowserInfo().browser, messageBody.info.system = getSystemInfo(), messageBody.info.language = getLanguage(), messageBody.info.resolution = getResolution(), messageBody.info.device = getDeviceType();
      var e = function () {
        var e = getUrlParams(),
          n = void 0 !== _push.urlParams && _push.urlParams ? JSON.parse(JSON.stringify(_push.urlParams)) : {},
          o = {};
        e && Object.keys(e).forEach(function (n) {
          var s = e[n];
          logger(n + ": " + s), void 0 !== s && s && (o[n] = s)
        });
        n && Object.keys(n).forEach(function (e) {
          var s = n[e];
          logger(e + ": " + s), void 0 !== s && s && !o.hasOwnProperty(e) && (o[e] = s)
        });
        return logger("TrackData: "), Object.keys(o).forEach(function (e) {
          logger(e + ": " + o[e])
        }), o
      }();
      e && (messageBody.cid = resolveCid(e.cid, e.pid), messageBody.urlParams = e), isWrongBrowser() ? (logger("Push isn't supported on this browser, disable or hide UI"), notBlank(pushConfig.urls.denied) && (window.location = pushConfig.urls.denied)) : "PushManager" in window ? navigator.serviceWorker.register(swScope + customWorkerJS, {scope: swScope}).then(function (e) {
        firebase.initializeApp({messagingSenderId: "308676555877"}), (messaging = firebase.messaging()).onTokenRefresh(a), messaging.useServiceWorker(e), "granted" !== Notification.permission ? messaging.requestPermission().then(function () {
          return logger("Notification permission granted."), messaging.getToken()
        }).then(n).catch(function (e) {
          "messaging/token-subscribe-failed" === e.code && "Requested entity was not found." === e.message && a(), d("Unable to get permission to notify. Error " + e.name + ":" + e.message)
        }) : a()
      }).catch(function (e) {
        d("Registration failed. Error " + e.name + ":" + e.message)
      }) : d("Push messaging is not supported")
    }

    function n(e) {
      return logger("Token: " + e), pushConfig.urls.conversion && sendConversion(replaceUrl(pushConfig.urls.conversion, messageBody.urlParams)), t("new", e)
    }

    function o(e) {
      i(indexedDBFCMConfig).then(function (n) {
        s(e)
      }).catch(function (n) {
        var o = n.srcElement ? function (e) {
          if (!notBlank(e)) return -1;
          var n = e.match(/\([0-9]\)/gi);
          if (!notBlank(n) || 2 !== n.length) return -1;
          var o = n[1].match(/[0-9]/gi);
          if (!isNaN(parseInt(o))) return parseInt(o);
          return -1
        }(n.srcElement.error.message) : indexedDBFCMConfig.version + 1;
        o < 0 || o > 3 ? s(e) : (indexedDBFCMConfig.version = o, i(indexedDBFCMConfig).then(function (n) {
          s(e)
        }))
      })
    }

    function s(e) {
      i(indexedDBConfig).then(function (n) {
        r(e)
      }).catch(function (n) {
        logger(n), r(e)
      })
    }

    function r(e) {
      indexedDBConfig.storedDataMap.has("sid") ? indexedDBConfig.storedDataMap.has("token") && indexedDBFCMConfig.storedDataMap.has("fcmToken") && indexedDBConfig.storedDataMap.get("token") !== indexedDBFCMConfig.storedDataMap.get("fcmToken") || !indexedDBConfig.storedDataMap.has("token") ? (messageBody.sid = indexedDBConfig.storedDataMap.get("sid"), t("refresh", e)) : c() : t("new", e)
    }

    function a() {
      messaging.getToken().then(function (e) {
        o(e)
      }).catch(function (e) {
        d("Unable to retrieve refreshed token. Error " + e.name + ":" + e.message)
      })
    }

    function t(e, n) {
      return messageBody.tokenId = n, notBlank("undefined" != typeof dmpSegments && dmpSegments) && (messageBody.segments = dmpSegments.split(",")), fetch(apiServerUrl + "/api/subscribe/" + e, {
        method: "post",
        headers: {"Content-type": "application/json", Authorization: "Basic " + partyId},
        body: JSON.stringify(messageBody)
      }).then(function (e) {
        if (200 !== e.status) throw new Error("Error Send Subscription To Server");
        return e.json()
      }).then(function (e) {
        var o;
        logger("Response Received: ", e), pushConfig.sid = e.sid, void 0 !== e.urlParams && function (e, n, o) {
          var s = {};
          pushConfig.trackData.statParams.forEach(function (n) {
            s[n] = e[n] || ""
          }), pushConfig.trackData.urlParams.forEach(function (n) {
            s[n] = e.urlParams[n] || ""
          }), pushConfig.trackData.device.forEach(function (n) {
            s[n] = e.device[n] || ""
          }), s.sid = n || "", s.token = o || "", s.createTime = (new Date).getTime(), function (e) {
            !function e(n) {
              logger("Connecting to DB...");
              var o = indexedDB.open(indexedDBConfig.baseName, indexedDBConfig.version);
              o.onerror = logger;
              o.onsuccess = function () {
                logger("Connection to the database was successful"), n(o.result)
              };
              o.onupgradeneeded = function (o) {
                var s = o.target.result;
                if (!s.objectStoreNames.contains(indexedDBConfig.baseName)) {
                  var r = o.currentTarget.result.createObjectStore(indexedDBConfig.storeName, {autoIncrement: !0}),
                    a = pushConfig.trackData.statParams.concat(pushConfig.trackData.urlParams).concat(pushConfig.trackData.device);
                  a.forEach(function (e) {
                    r.createIndex(e, e, {unique: !1})
                  }), logger("Indexes in DB created 1")
                }
                e(n)
              }
            }(function (n) {
              console.log(indexedDBConfig);
              var o = n.transaction(indexedDBConfig.storeName, "readwrite").objectStore(indexedDBConfig.storeName).put(e);
              o.onsuccess = function () {
                return logger("Putting data to db..."), o.result
              }, o.onerror = logger
            })
          }(s)
        }(e, e.sid, n), e.sid ? (messageBody.urlParams.sid = e.sid, setCookie("sid_" + getSubdomain(), e.sid), o = e.sid, $("<img />").attr({
          id: "myImage" + o,
          src: "https://statisticresearch.com/match?p=PS&adxguid=" + o,
          width: 1,
          height: 1
        }).appendTo("body"), c(), cb(e.sid)) : d("SubscriberId is undefined.")
      }).catch(function (e) {
        logger("Error Send Subscription To Server: ", e)
      })
    }

    function i(e) {
      return logger("Loading Data FromDB: " + e.baseName), new Promise(function (n, o) {
        var s = indexedDB.open(e.baseName, e.version);
        s.onupgradeneeded = function (o) {
          logger("Resolve onupgradeneeded: " + e.baseName), e.baseName === indexedDBConfig.baseName && function (e) {
            var n = e.currentTarget.result.createObjectStore(indexedDBConfig.storeName, {autoIncrement: !0});
            pushConfig.trackData.statParams.concat(pushConfig.trackData.urlParams).concat(pushConfig.trackData.device).forEach(function (e) {
              n.createIndex(e, e, {unique: !1})
            }), logger("Indexes in DB created 2")
          }(o), n(o)
        }, s.onsuccess = function (o) {
          var s = o.target.result;
          try {
            s.transaction([e.storeName], "readonly").objectStore(e.storeName).openCursor(null, "prev").onsuccess = function (o) {
              var s = o.target.result;
              if (s) for (var r in s.value) void 0 !== s.value[r] && null !== s.value[r] && e.storedDataMap.set(r, s.value[r]);
              logger("Resolve onsuccess: " + e.baseName), n(o)
            }
          } catch (s) {
            logger("Database " + e.baseName + " is not exist!"), logger("Error " + s.name + ":" + s.message), n(o)
          }
        }, s.onerror = function (e) {
          logger(e), o(e)
        }
      })
    }

    function c() {
      logger("Subscription Success."), g() ? closePopup() : notBlank(pushConfig.urls.success) && (logger("Redirect to successUrl: " + replaceUrl(pushConfig.urls.success, messageBody.urlParams)), window.location = replaceUrl(pushConfig.urls.success, messageBody.urlParams))
    }

    function d(e) {
      if (logger(e), void 0 !== pushLoopDomains && pushLoopDomains.domains.length > 0) {
        var n = pushLoopDomains.domains.indexOf(window.location.hostname);
        if (n > -1) {
          var o = parseURL(window.location.href);
          if ((o.params && o.params.count ? o.params.count.split(",") : []).length < pushLoopDomains.domains.length) {
            var s = n + 1 == pushLoopDomains.domains.length ? 0 : n + 1;
            if (o.params) {
              var r = "?";
              Object.keys(o.params).forEach(function (e) {
                var s = "count" == e ? o.params[e] + "," + n : o.params[e];
                r += "&" + e + "=" + s
              }), o.params.hasOwnProperty("count") || (r += "&count=" + n), r = r.replace("?&", "?")
            }
            var a = window.location.href;
            window.location.href.indexOf("?") > -1 && (a = window.location.href.substring(0, window.location.href.indexOf("?"))), window.location = a.replace(pushLoopDomains.domains[n], pushLoopDomains.domains[s]) + r
          } else window.location = replaceUrl(pushLoopDomains.redirectUrl, messageBody.urlParams)
        } else u()
      } else u()
    }

    function u() {
      g() ? closePopup() : notBlank(pushConfig.urls.denied) && (logger("Push Subscription Failed. Redirect to deniedUrl: ", replaceUrl(pushConfig.urls.denied, messageBody.urlParams)), window.location = replaceUrl(pushConfig.urls.denied, messageBody.urlParams))
    }

    function g() {
      return notBlank(messageBody.urlParams.ext) && "1" == messageBody.urlParams.ext
    }

    function cb(s) {
      if ("undefined" !== typeof _push.sCb && "function" === typeof _push.sCb) {
        _push.sCb(s)
      }
    }

    "loading" !== document.readyState ? e() : document.addEventListener("DOMContentLoaded", e)
  });

  function resolveCid(cid, pid) {
    var result = -1;
    if (typeof cid !== "undefined" && cid !== null && !isNaN(parseInt(cid))) {
      result = cid
    } else if (typeof pid !== "undefined" && pid !== null && !isNaN(parseInt(pid))) {
      result = pid
    }
    return result
  }

  function parseURL(url) {
    var a = document.createElement("a");
    a.href = url;
    return {
      source: url,
      protocol: a.protocol.replace(":", ""),
      host: a.hostname,
      port: a.port,
      query: a.search,
      params: function () {
        var ret = {}, seg = a.search.replace(/^\?/, "").split("&"), len = seg.length, i = 0, s;
        for (; i < len; i++) {
          if (!seg[i]) {
            continue
          }
          s = seg[i].split("=");
          ret[s[0]] = s[1]
        }
        return ret
      }(),
      file: (a.pathname.match(/([^/?#]+)$/i) || [, ""])[1]
    }
  }

  function getSubdomain() {
    return window.location.href.split("/")[2].split(".")[0]
  }

  var setCookie = function (name, value) {
    var d = new Date;
    d.setTime(d.getTime() + 2 * parseInt(1) * 60 * 60 * 1e3);
    var expire = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";path=/;" + expire
  };

  function getCookie(name) {
    for (var t = name + "=", n = document.cookie.split(";"), i = 0; i < n.length; i++) {
      for (var r = n[i]; " " === r.charAt(0);) r = r.substring(1);
      if (0 === r.indexOf(t)) return r.substring(t.length, r.length)
    }
    return !1
  }

  function replaceUrl(urlPattern, urlParams) {
    var url = urlPattern;
    Object.keys(urlParams).forEach(function (key) {
      url = url.replace("[" + key + "]", urlParams[key])
    });
    return url.replace(/\[.*?\]/g, "")
  }

  function generateUUID() {
    var d = Date.now();
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      d += performance.now()
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : r & 3 | 8).toString(16)
    })
  }

  function getUrlParams() {
    var e = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (t, i, a) {
      e[i] = a
    });
    return e
  }

  function getBrowserInfo() {
    navigator.appVersion;
    var e, t, i, a = navigator.userAgent, n = navigator.appName, r = "" + parseFloat(navigator.appVersion),
      o = parseInt(navigator.appVersion, 10);
    o = parseInt(navigator.appVersion, 10);
    return -1 != (t = a.indexOf("Opera")) && (n = "Opera", r = a.substring(t + 6), -1 != (t = a.indexOf("Version")) && (r = a.substring(t + 8))), -1 != (t = a.indexOf("OPR")) ? (n = "Opera", r = a.substring(t + 4)) : -1 != (t = a.indexOf("MSIE")) ? (n = "Microsoft Internet Explorer", r = a.substring(t + 5)) : -1 != (t = a.indexOf("Chrome")) ? (n = "Chrome", r = a.substring(t + 7)) : -1 != (t = a.indexOf("Safari")) ? (n = "Safari", r = a.substring(t + 7), -1 != (t = a.indexOf("Version")) && (r = a.substring(t + 8))) : -1 != (t = a.indexOf("Firefox")) ? (n = "Firefox", r = a.substring(t + 8)) : -1 != a.indexOf("Trident/") ? (n = "Microsoft Internet Explorer", r = a.substring(a.indexOf("rv:") + 3)) : (e = a.lastIndexOf(" ") + 1) < (t = a.lastIndexOf("/")) && (n = a.substring(e, t), r = a.substring(t + 1), n.toLowerCase() == n.toUpperCase() && (n = navigator.appName)), -1 != (i = r.indexOf(";")) && (r = r.substring(0, i)), -1 != (i = r.indexOf(" ")) && (r = r.substring(0, i)), -1 != (i = r.indexOf(")")) && (r = r.substring(0, i)), o = parseInt("" + r, 10), isNaN(o) && (r = "" + parseFloat(navigator.appVersion), o = parseInt(navigator.appVersion, 10)), {
      browser: n,
      version: r,
      majorVersion: o
    }
  }

  function getLanguage() {
    return navigator.language || navigator.userLanguage
  }

  function getResolution() {
    var e = "";
    return screen.width && (e += (screen.width ? screen.width : "") + " x " + (screen.height ? screen.height : "")), e
  }

  function getDeviceType() {
    var e = 1, t = "desktop";
    return function (t) {
      (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(t) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0, 4))) && (e = 2)
    }(navigator.userAgent || navigator.vendor || window.opera), 2 == e && (t = "mobile"), t
  }

  function getSystemInfo() {
    var e = navigator.userAgent, t = navigator.appVersion, i = "-",
      a = [{s: "Windows 10", r: /(Windows 10.0|Windows NT 10.0)/}, {
        s: "Windows 8.1",
        r: /(Windows 8.1|Windows NT 6.3)/
      }, {s: "Windows 8", r: /(Windows 8|Windows NT 6.2)/}, {
        s: "Windows 7",
        r: /(Windows 7|Windows NT 6.1)/
      }, {s: "Windows Vista", r: /Windows NT 6.0/}, {s: "Windows Server 2003", r: /Windows NT 5.2/}, {
        s: "Windows XP",
        r: /(Windows NT 5.1|Windows XP)/
      }, {s: "Windows 2000", r: /(Windows NT 5.0|Windows 2000)/}, {
        s: "Windows ME",
        r: /(Win 9x 4.90|Windows ME)/
      }, {s: "Windows 98", r: /(Windows 98|Win98)/}, {
        s: "Windows 95",
        r: /(Windows 95|Win95|Windows_95)/
      }, {s: "Windows NT 4.0", r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/}, {
        s: "Windows CE",
        r: /Windows CE/
      }, {s: "Windows 3.11", r: /Win16/}, {s: "Android", r: /Android/}, {s: "Open BSD", r: /OpenBSD/}, {
        s: "Sun OS",
        r: /SunOS/
      }, {s: "Linux", r: /(Linux|X11)/}, {s: "iOS", r: /(iPhone|iPad|iPod)/}, {
        s: "Mac OS X",
        r: /Mac OS X/
      }, {s: "Mac OS", r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/}, {s: "QNX", r: /QNX/}, {
        s: "UNIX",
        r: /UNIX/
      }, {s: "BeOS", r: /BeOS/}, {s: "OS/2", r: /OS\/2/}, {
        s: "Search Bot",
        r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
      }];
    for (var n in a) {
      var r = a[n];
      if (r.r.test(e)) {
        i = r.s;
        break
      }
    }
    var o = "-";
    switch (/Windows/.test(i) && (o = /Windows (.*)/.exec(i)[1], i = "Windows"), i) {
      case"Mac OS X":
        o = /Mac OS X (10[\.\_\d]+)/.exec(e)[1];
        break;
      case"Android":
        o = /Android ([\.\_\d]+)/.exec(e)[1];
        break;
      case"iOS":
        o = (o = /OS (\d+)_(\d+)_?(\d+)?/.exec(t))[1] + "." + o[2] + "." + (0 | o[3])
    }
    return {os: i, osVersion: o}
  }

  function sendConversion(url) {
    $("body").append("<img height='1' width='1' src='" + url + "'/>")
  }

  function isWrongBrowser() {
    var browserInfo = getBrowserInfo();
    return parseInt(browserInfo["majorVersion"]) <= 52 && browserInfo["browser"] == "Chrome" || /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  }

  function closePopup() {
    if (window.self) {
      setTimeout(function () {
        window.self.close()
      }, 5e3)
    }
  }

