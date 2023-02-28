
  "use strict";
  importScripts("https://www.gstatic.com/firebasejs/5.0.2/firebase-app.js"), importScripts("https://www.gstatic.com/firebasejs/5.0.2/firebase-messaging.js");
  var versionFromParam = "?ver=20200709",
    pushConfig = {apiServerUrl: "https://daailynews.com", partyId: "cHVzaGJyb3dzZTo6Q2hHNkxuQg=="};
  firebase.initializeApp({messagingSenderId: "308676555877"});
  var isoCountries = initCountries(),
    indexedDBConfig = {baseName: "subscriberData", storeName: "subscriberData", storedDataMap: new Map, version: 2},
    indexedDBFCMConfig = {
      baseName: "fcm_token_details_db",
      storeName: "fcm_token_object_Store",
      storedDataMap: new Map,
      version: 1
    };

  function getNotification(a) {
    var e = indexedDBFCMConfig.storedDataMap.has("fcmToken") ? indexedDBFCMConfig.storedDataMap.get("fcmToken") : void 0,
      n = indexedDBConfig.storedDataMap.has("sid") ? indexedDBConfig.storedDataMap.get("sid") : void 0,
      i = {country: getCountryName(), city: getCityName(), device: getDeviceName()};
    console.log("fcmToken " + e), console.log("sid " + n), null == e && (e = indexedDBConfig.storedDataMap.has("token") ? indexedDBConfig.storedDataMap.get("token") : void 0);
    var t = a.data.json(), o = JSON.parse(t.data.push_params);
    const r = replaceMacro(t.data.title, i);
    var s = {
      body: replaceMacro(t.data.body, i),
      icon: t.data.icon,
      requireInteraction: !0,
      data: {link: t.data.link, token: e, nid: o.nid, sid: n}
    };
    if (t.data.image && (s.image = t.data.image), t.data.badge && (s.badge = t.data.badge), t.data.vibration && (s.vibrate = t.data.vibration.split(",").map(Number)), t.data.actions && t.data.actions.size > 0) {
      var d = [], c = JSON.parse(t.data.actions);
      c.forEach(function (a) {
        d.push(a.link)
      }), s.actions = c, s.data.actionsLink = d
    }
    return sendMessage("delivery", o.nid, e, null), self.registration.showNotification(r, s)
  }

  function sendMessage(a, e, n, i) {
    return fetch(createTrackEventUrl(a, e, n, i), {
      method: "post",
      headers: {Accept: "application/json", "Content-Type": "application/json"}
    }).then(function (a) {
      console.log("Send message with status : " + a.status)
    })
  }

  function createTrackEventUrl(a, e, n, i) {
    var t = createTrackUrl(a, e, n);
    return "clickV2" === a && (t += "/click_id/" + i), indexedDBConfig.storedDataMap.has("sid") && "" !== indexedDBConfig.storedDataMap.get("sid") && (t += "/sid/" + indexedDBConfig.storedDataMap.get("sid")), t = addTrackParams(t)
  }

  self.addEventListener("push", function (a) {
    self.registration.update();
    const e = Promise.all([loadDataFromDBToMap(indexedDBConfig), loadDataFromDBFCM()]).then(function (e) {
      return getNotification(a)
    });
    a.waitUntil(e)
  }), self.addEventListener("notificationclick", function (a) {
    a.notification.close();
    var e = encodeURIComponent(a.notification.data.token), n = a.notification.data.nid, i = a.notification.data.link,
      t = a.notification.data.sid;
    if (a.notification.actions) var o = a.notification.actions, r = a.notification.data.actionsLink;
    var s = generateUUID();
    sendMessage("clickV2", n, e, s), void 0 !== o && o.length > 0 && ("actionOne" === a.action ? i = r[0] : "actionTwo" === a.action ? i = r[1] : "actionThree" === a.action && (i = r[2])), i && (i = (i = i.replace("[click_id]", s)).replace("[fcm_token]", e));
    var d = pushConfig.apiServerUrl + "/api/track/click-url/nid/" + n + "/token/" + e + "/sid/" + t + "/click_id/" + s,
      c = {link: i};
    i.indexOf("[") > -1 && i.indexOf("]") > -1 ? a.waitUntil(fetch(d, {
      method: "post",
      headers: {Accept: "application/json", "Content-Type": "application/json"},
      body: JSON.stringify(c)
    }).then(function (a) {
      return 200 !== a.status && clients.openWindow(i), a.json().then(function (a) {
        a && a.clickUrl && (i = a.clickUrl), clients.openWindow(i)
      })
    }).catch(function (a) {
      clients.openWindow(i)
    })) : clients.openWindow(i)
  }), self.addEventListener("pushsubscriptionchange", function (a) {
    console.log("Subscription expired"), a.waitUntil(firebase.messaging.requestPermission().then(function () {
      return firebase.messaging.getToken()
    }).then(function (a) {
      messageBody.tokenId = a, messageBody.sid = indexedDBConfig.storedDataMap.has("sid") ? indexedDBConfig.storedDataMap.get("sid") : "", messageBody.cid = indexedDBConfig.storedDataMap.has("cid") ? indexedDBConfig.storedDataMap.get("cid") : -1;
      var e = {};
      return ["s1", "s2", "s3", "s4", "cid", "eauuid", "tid"].forEach(function (a) {
        indexedDBConfig.storedDataMap.has(a) && (e[a] = indexedDBConfig.storedDataMap.get(a))
      }), messageBody.urlParams = e, fetch(pushConfig.apiServerUrl + "/api/subscribe/refresh/from/sw" + versionFromParam, {
        method: "post",
        headers: {"Content-type": "application/json", Authorization: "Basic " + pushConfig.partyId},
        body: JSON.stringify(messageBody)
      })
    }))
  });
  var createTrackUrl = function (a, e, n) {
    return pushConfig.apiServerUrl + "/api/track/" + a + "/nid/" + e + "/token/" + n
  }, addTrackParams = function (a) {
    if (a += versionFromParam, indexedDBConfig.storedDataMap.size < 0) return a;
    return a += "&", ["s1", "s2", "s3", "s4", "eauuid", "tid"].forEach(function (e) {
      indexedDBConfig.storedDataMap.has(e) && (a += e + "=" + indexedDBConfig.storedDataMap.get(e) + "&")
    }), a
  };

  function loadDataFromDBToMap(a) {
    return new Promise(function (e, n) {
      var i = indexedDB.open(a.baseName, a.version);
      i.onupgradeneeded = function (n) {
        console.log("Resolve onupgradeneeded: " + a.baseName), e(n)
      }, i.onsuccess = function (n) {
        var t = i.result;
        try {
          t.transaction([a.storeName], "readwrite").objectStore(a.storeName).openCursor(null, "prev").onsuccess = function (n) {
            var i = n.target.result;
            if (i) for (var t in i.value) void 0 !== i.value[t] && null !== i.value[t] && a.storedDataMap.set(t, i.value[t]);
            e(n)
          }
        } catch (a) {
          console.log("Error " + a.name + ":" + a.message), e(n)
        }
      }, i.onerror = function (a) {
        n(a)
      }
    })
  }

  function loadDataFromDBFCM() {
    return new Promise(function (a, e) {
      loadDataFromDBToMap(indexedDBFCMConfig).then(function (e) {
        a()
      }).catch(function (e) {
        var n = e.srcElement ? parseNewVersion(e.srcElement.error.message) : indexedDBFCMConfig.version + 1;
        n < 0 || n > 3 ? a() : (indexedDBFCMConfig.version = n, loadDataFromDBToMap(indexedDBFCMConfig).then(function (e) {
          a()
        }))
      })
    })
  }

  function parseNewVersion(a) {
    if (!notBlank(a)) return -1;
    var e = a.match(/\([0-9]\)/gi);
    if (!notBlank(e) || 2 !== e.length) return -1;
    var n = e[1].match(/[0-9]/gi);
    return isNaN(parseInt(n)) ? -1 : parseInt(n)
  }

  function notBlank(a) {
    return null != a && "" != a
  }

  function replaceMacro(a, e) {
    return void 0 !== e && null != e && e && a ? (Object.keys(e).forEach(function (n) {
      a = a.replace("[" + n + "]", e[n])
    }), a.replace(/\[.*?\]/g, "")) : a
  }

  function getCityName() {
    var a = indexedDBConfig.storedDataMap.has("city") ? indexedDBConfig.storedDataMap.get("city") : "";
    return void 0 !== a && "" !== a ? a.charAt(0).toUpperCase() + a.slice(1) : ""
  }

  function getCountryName() {
    var a = indexedDBConfig.storedDataMap.has("country") ? indexedDBConfig.storedDataMap.get("country") : "";
    return void 0 === a || "" === a ? "" : isoCountries.hasOwnProperty(a) ? isoCountries[a] : a
  }

  function getDeviceName() {
    var a = indexedDBConfig.storedDataMap.has("maker") ? indexedDBConfig.storedDataMap.get("maker") : "";
    return a += indexedDBConfig.storedDataMap.has("model") ? " " + indexedDBConfig.storedDataMap.get("model") : ""
  }

  function generateUUID() {
    var a = Date.now();
    return "undefined" != typeof performance && "function" == typeof performance.now && (a += performance.now()), "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (e) {
      var n = (a + 16 * Math.random()) % 16 | 0;
      return a = Math.floor(a / 16), ("x" === e ? n : 3 & n | 8).toString(16)
    })
  }

  function initCountries() {
    return {
      AF: "Afghanistan",
      AX: "Aland Islands",
      AL: "Albania",
      DZ: "Algeria",
      AS: "American Samoa",
      AD: "Andorra",
      AO: "Angola",
      AI: "Anguilla",
      AQ: "Antarctica",
      AG: "Antigua And Barbuda",
      AR: "Argentina",
      AM: "Armenia",
      AW: "Aruba",
      AU: "Australia",
      AT: "Austria",
      AZ: "Azerbaijan",
      BS: "Bahamas",
      BH: "Bahrain",
      BD: "Bangladesh",
      BB: "Barbados",
      BY: "Belarus",
      BE: "Belgium",
      BZ: "Belize",
      BJ: "Benin",
      BM: "Bermuda",
      BT: "Bhutan",
      BO: "Bolivia",
      BA: "Bosnia And Herzegovina",
      BW: "Botswana",
      BV: "Bouvet Island",
      BR: "Brazil",
      IO: "British Indian Ocean Territory",
      BN: "Brunei Darussalam",
      BG: "Bulgaria",
      BF: "Burkina Faso",
      BI: "Burundi",
      KH: "Cambodia",
      CM: "Cameroon",
      CA: "Canada",
      CV: "Cape Verde",
      KY: "Cayman Islands",
      CF: "Central African Republic",
      TD: "Chad",
      CL: "Chile",
      CN: "China",
      CX: "Christmas Island",
      CC: "Cocos (Keeling) Islands",
      CO: "Colombia",
      KM: "Comoros",
      CG: "Congo",
      CD: "Congo, Democratic Republic",
      CK: "Cook Islands",
      CR: "Costa Rica",
      CI: "Cote D'Ivoire",
      HR: "Croatia",
      CU: "Cuba",
      CY: "Cyprus",
      CZ: "Czech Republic",
      DK: "Denmark",
      DJ: "Djibouti",
      DM: "Dominica",
      DO: "Dominican Republic",
      EC: "Ecuador",
      EG: "Egypt",
      SV: "El Salvador",
      GQ: "Equatorial Guinea",
      ER: "Eritrea",
      EE: "Estonia",
      ET: "Ethiopia",
      FK: "Falkland Islands (Malvinas)",
      FO: "Faroe Islands",
      FJ: "Fiji",
      FI: "Finland",
      FR: "France",
      GF: "French Guiana",
      PF: "French Polynesia",
      TF: "French Southern Territories",
      GA: "Gabon",
      GM: "Gambia",
      GE: "Georgia",
      DE: "Germany",
      GH: "Ghana",
      GI: "Gibraltar",
      GR: "Greece",
      GL: "Greenland",
      GD: "Grenada",
      GP: "Guadeloupe",
      GU: "Guam",
      GT: "Guatemala",
      GG: "Guernsey",
      GN: "Guinea",
      GW: "Guinea-Bissau",
      GY: "Guyana",
      HT: "Haiti",
      HM: "Heard Island & Mcdonald Islands",
      VA: "Holy See (Vatican City State)",
      HN: "Honduras",
      HK: "Hong Kong",
      HU: "Hungary",
      IS: "Iceland",
      IN: "India",
      ID: "Indonesia",
      IR: "Iran, Islamic Republic Of",
      IQ: "Iraq",
      IE: "Ireland",
      IM: "Isle Of Man",
      IL: "Israel",
      IT: "Italy",
      JM: "Jamaica",
      JP: "Japan",
      JE: "Jersey",
      JO: "Jordan",
      KZ: "Kazakhstan",
      KE: "Kenya",
      KI: "Kiribati",
      KR: "Korea",
      KW: "Kuwait",
      KG: "Kyrgyzstan",
      LA: "Lao People's Democratic Republic",
      LV: "Latvia",
      LB: "Lebanon",
      LS: "Lesotho",
      LR: "Liberia",
      LY: "Libyan Arab Jamahiriya",
      LI: "Liechtenstein",
      LT: "Lithuania",
      LU: "Luxembourg",
      MO: "Macao",
      MK: "Macedonia",
      MG: "Madagascar",
      MW: "Malawi",
      MY: "Malaysia",
      MV: "Maldives",
      ML: "Mali",
      MT: "Malta",
      MH: "Marshall Islands",
      MQ: "Martinique",
      MR: "Mauritania",
      MU: "Mauritius",
      YT: "Mayotte",
      MX: "Mexico",
      FM: "Micronesia, Federated States Of",
      MD: "Moldova",
      MC: "Monaco",
      MN: "Mongolia",
      ME: "Montenegro",
      MS: "Montserrat",
      MA: "Morocco",
      MZ: "Mozambique",
      MM: "Myanmar",
      NA: "Namibia",
      NR: "Nauru",
      NP: "Nepal",
      NL: "Netherlands",
      AN: "Netherlands Antilles",
      NC: "New Caledonia",
      NZ: "New Zealand",
      NI: "Nicaragua",
      NE: "Niger",
      NG: "Nigeria",
      NU: "Niue",
      NF: "Norfolk Island",
      MP: "Northern Mariana Islands",
      NO: "Norway",
      OM: "Oman",
      PK: "Pakistan",
      PW: "Palau",
      PS: "Palestinian Territory, Occupied",
      PA: "Panama",
      PG: "Papua New Guinea",
      PY: "Paraguay",
      PE: "Peru",
      PH: "Philippines",
      PN: "Pitcairn",
      PL: "Poland",
      PT: "Portugal",
      PR: "Puerto Rico",
      QA: "Qatar",
      RE: "Reunion",
      RO: "Romania",
      RU: "Russian Federation",
      RW: "Rwanda",
      BL: "Saint Barthelemy",
      SH: "Saint Helena",
      KN: "Saint Kitts And Nevis",
      LC: "Saint Lucia",
      MF: "Saint Martin",
      PM: "Saint Pierre And Miquelon",
      VC: "Saint Vincent And Grenadines",
      WS: "Samoa",
      SM: "San Marino",
      ST: "Sao Tome And Principe",
      SA: "Saudi Arabia",
      SN: "Senegal",
      RS: "Serbia",
      SC: "Seychelles",
      SL: "Sierra Leone",
      SG: "Singapore",
      SK: "Slovakia",
      SI: "Slovenia",
      SB: "Solomon Islands",
      SO: "Somalia",
      ZA: "South Africa",
      GS: "South Georgia And Sandwich Isl.",
      ES: "Spain",
      LK: "Sri Lanka",
      SD: "Sudan",
      SR: "Suriname",
      SJ: "Svalbard And Jan Mayen",
      SZ: "Swaziland",
      SE: "Sweden",
      CH: "Switzerland",
      SY: "Syrian Arab Republic",
      TW: "Taiwan",
      TJ: "Tajikistan",
      TZ: "Tanzania",
      TH: "Thailand",
      TL: "Timor-Leste",
      TG: "Togo",
      TK: "Tokelau",
      TO: "Tonga",
      TT: "Trinidad And Tobago",
      TN: "Tunisia",
      TR: "Turkey",
      TM: "Turkmenistan",
      TC: "Turks And Caicos Islands",
      TV: "Tuvalu",
      UG: "Uganda",
      UA: "Ukraine",
      AE: "United Arab Emirates",
      GB: "United Kingdom",
      US: "United States",
      UM: "United States Outlying Islands",
      UY: "Uruguay",
      UZ: "Uzbekistan",
      VU: "Vanuatu",
      VE: "Venezuela",
      VN: "Viet Nam",
      VG: "Virgin Islands, British",
      VI: "Virgin Islands, U.S.",
      WF: "Wallis And Futuna",
      EH: "Western Sahara",
      YE: "Yemen",
      ZM: "Zambia",
      ZW: "Zimbabwe"
    }
  }

  self.addEventListener("install", function (a) {
    a.waitUntil(self.skipWaiting())
  }), self.addEventListener("activate", function (a) {
    a.waitUntil(self.clients.claim())
  }), self.addEventListener("fetch", function (a) {
    a.respondWith(fetch(a.request).catch(function () {
      return caches.match(a.request)
    }))
  }), self.addEventListener("updatefound", function () {
    console.log("onupdate found")
  });
