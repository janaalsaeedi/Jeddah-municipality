(function () {
    "use strict";

    var form = document.getElementById("pumpingForm");
    var formMessage = document.getElementById("formMessage");
    var addPumpBtn = document.getElementById("addPumpBtn");
    var pumpsTableBody = document.getElementById("pumpsTableBody");
    var pumpsTableWrap = document.getElementById("pumpsTableWrap");
    var backBtn = document.getElementById("backBtn");
    var ratingStars = document.getElementById("ratingStars");
    var ratingMessage = document.getElementById("ratingMessage");

    var pumps = [];

    var requiredFieldIds = [
        "projectName",
        "projectStatus",
        "ownerId",
        "buildingPermit",
        "diggingPermit",
        "pumpingStart",
        "pumpingMonths",
        "consultant",
        "contractor",
        "lab",
        "coordX",
        "coordY",
        "municipality",
        "district",
        "street",
        "pumpingTxn",
        "fileCommercial",
        "fileBuilding",
        "fileBank",
        "fileOwnerId",
        "fileSoil",
        "fileSketch",
        "filePumpLine",
        "fileAerial",
        "filePledge",
        "agree"
    ];

    function showError(fieldId, show) {
        var el = document.getElementById(fieldId);
        var err = document.querySelector('[data-error-for="' + fieldId + '"]');
        var zone = document.querySelector('[data-uploader="' + fieldId + '"]');

        if (el) {
            el.classList.toggle("is-invalid", show);
            if (el._flatpickr && el._flatpickr.altInput) {
                el._flatpickr.altInput.classList.toggle("is-invalid", show);
            }
        }
        if (zone) {
            zone.classList.toggle("is-invalid", show);
        }
        if (err) {
            err.classList.toggle("show", show);
        }
    }

    function clearErrors() {
        requiredFieldIds.forEach(function (id) {
            showError(id, false);
        });
        showError("pumpType", false);
        showError("pumpCount", false);
        showError("pumpMonths", false);
        showError("pumpMeters", false);
        showError("pumpsList", false);
        formMessage.className = "form-message";
        formMessage.textContent = "";
    }

    function isFilled(el) {
        if (!el) {
            return false;
        }
        if (el.type === "checkbox") {
            return el.checked;
        }
        if (el.type === "file") {
            return el.files && el.files.length > 0;
        }
        return String(el.value || "").trim() !== "";
    }

    function renderPumps() {
        pumpsTableBody.innerHTML = "";

        if (pumpsTableWrap) {
            pumpsTableWrap.hidden = pumps.length === 0;
        }

        if (pumps.length === 0) {
            return;
        }

        pumps.forEach(function (pump, index) {
            var tr = document.createElement("tr");
            tr.innerHTML =
                '<td data-label="#">' + (index + 1) + "</td>" +
                '<td data-label="نوع المضخة">' + pump.type + "</td>" +
                '<td data-label="عدد المضخات">' + pump.count + "</td>" +
                '<td data-label="عدد الشهور">' + pump.months + "</td>" +
                '<td data-label="الأمتار المستحقة">' + pump.meters + "</td>" +
                '<td data-label="إجراء"><button type="button" class="btn-remove" data-index="' + index + '" aria-label="حذف">' +
                '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>' +
                '<span>حذف</span></button></td>';
            pumpsTableBody.appendChild(tr);
        });
    }

    function resetPumpInputs() {
        document.getElementById("pumpType").selectedIndex = 0;
        document.getElementById("pumpCount").value = "";
        document.getElementById("pumpMonths").value = "0";
        document.getElementById("pumpMeters").value = "";
    }

    addPumpBtn.addEventListener("click", function () {
        var typeEl = document.getElementById("pumpType");
        var countEl = document.getElementById("pumpCount");
        var monthsEl = document.getElementById("pumpMonths");
        var metersEl = document.getElementById("pumpMeters");

        var typeOk = isFilled(typeEl);
        var countOk = isFilled(countEl) && Number(countEl.value) > 0;
        var monthsOk = isFilled(monthsEl) && Number(monthsEl.value) > 0;
        var metersOk = isFilled(metersEl) && Number(metersEl.value) > 0;

        showError("pumpType", !typeOk);
        showError("pumpCount", !countOk);
        showError("pumpMonths", !monthsOk);
        showError("pumpMeters", !metersOk);

        if (!typeOk || !countOk || !monthsOk || !metersOk) {
            return;
        }

        pumps.push({
            type: typeEl.value,
            count: Number(countEl.value),
            months: Number(monthsEl.value),
            meters: Number(metersEl.value)
        });

        showError("pumpsList", false);
        renderPumps();
        resetPumpInputs();
    });

    pumpsTableBody.addEventListener("click", function (event) {
        var btn = event.target.closest(".btn-remove");
        if (!btn) {
            return;
        }
        var index = Number(btn.getAttribute("data-index"));
        pumps.splice(index, 1);
        renderPumps();
    });

    /* ===== تقييم الخدمة واستبيان الفائدة ===== */
    (function initServiceFeedback() {
        var feedbackSurvey = document.getElementById("feedbackSurvey");
        var reasonsEl = document.getElementById("feedbackReasons");
        var closeBtn = document.getElementById("surveyCloseBtn");
        var submitBtn = document.getElementById("surveySubmitBtn");
        var feedbackResult = document.getElementById("feedbackResult");
        var rateServiceBtn = document.getElementById("rateServiceBtn");
        var ratingInteractive = document.getElementById("ratingInteractive");
        var currentType = "yes";
        var yesReasons = ["المحتوى ذو صلة", "لقد كانت مكتوبة بشكل جيد", "جعل التخطيط من السهل القراءة", "شيء آخر"];
        var noReasons = ["المحتوى غير ذي صلة", "المحتوى غير دقيق", "المحتوى طويل جدًا", "شيء آخر"];

        function renderReasons(type) {
            if (!reasonsEl) return;
            var list = type === "no" ? noReasons : yesReasons;
            reasonsEl.innerHTML = list.map(function(label, index) {
                return '<label class="feedback-reason"><input type="checkbox" name="feedbackReason" value="' + index + '"><span>' + label + '</span></label>';
            }).join("");
        }

        document.querySelectorAll(".btn-feedback").forEach(function(btn) {
            btn.addEventListener("click", function() {
                document.querySelectorAll(".btn-feedback").forEach(function(b) { b.classList.remove("active"); });
                btn.classList.add("active");
                currentType = btn.getAttribute("data-feedback") || "yes";
                if (feedbackResult) {
                    feedbackResult.textContent = currentType === "yes"
                        ? "60% من المستخدمين قالوا نعم من 2843 تقييمًا"
                        : "40% من المستخدمين قالوا لا من 2843 تقييمًا";
                }
                if (feedbackSurvey) {
                    renderReasons(currentType);
                    feedbackSurvey.hidden = false;
                    feedbackSurvey.setAttribute("data-feedback-type", currentType);
                    feedbackSurvey.scrollIntoView({behavior:"smooth", block:"start"});
                }
            });
        });

        if (closeBtn && feedbackSurvey) {
            closeBtn.addEventListener("click", function() { feedbackSurvey.hidden = true; });
        }

        if (submitBtn && feedbackSurvey) {
            submitBtn.addEventListener("click", function() {
                var selected = feedbackSurvey.querySelectorAll('input[name="feedbackReason"]:checked').length;
                if (!selected) {
                    alert("يرجى اختيار سبب واحد على الأقل.");
                    return;
                }
                submitBtn.textContent = "تم الإرسال";
                window.setTimeout(function(){
                    submitBtn.textContent = "إرسال";
                    feedbackSurvey.hidden = true;
                }, 700);
            });
        }

        if (rateServiceBtn && ratingInteractive) {
            rateServiceBtn.addEventListener("click", function() {
                rateServiceBtn.classList.add("is-selected");

                var selectedRating = Number(
                    ratingInteractive.querySelector("#ratingStars")?.getAttribute("data-rating") || 0
                );

                if (selectedRating > 0) {
                    showPlatformRatingAlert(selectedRating);
                    return;
                }

                alert("يرجى اختيار عدد النجوم أولاً.");
            });
        }
    })();

    function getRatingMessage(value) {
        var rounded = Math.round(Number(value) * 2) / 2;
        var messages = {
            "1": "نجمة واحدة",
            "2": "نجمتين",
            "3": "3 نجوم",
            "4": "4 نجوم",
            "5": "5 نجوم"
        };
        if (messages[String(rounded)]) {
            return "شكراً لك، تم تسجيل تقييمك من " + messages[String(rounded)] + ".";
        }
        if (rounded === 0.5) return "شكراً لك، تم تسجيل تقييمك من نصف نجمة.";
        if (rounded === 1.5) return "شكراً لك، تم تسجيل تقييمك من نجمة ونصف.";
        if (rounded === 2.5) return "شكراً لك، تم تسجيل تقييمك من نجمتين ونصف.";
        if (rounded === 3.5) return "شكراً لك، تم تسجيل تقييمك من 3 نجوم ونصف.";
        if (rounded === 4.5) return "شكراً لك، تم تسجيل تقييمك من 4 نجوم ونصف.";
        return "شكراً لك، تم تسجيل تقييمك.";
    }

    function showPlatformRatingAlert(value) {
        var message = getRatingMessage(value);
        var existing = document.getElementById("platformRatingAlert");
        if (existing) {
            existing.remove();
        }

        var backdrop = document.createElement("div");
        backdrop.className = "platform-alert-backdrop";
        backdrop.id = "platformRatingAlert";

        var dialog = document.createElement("div");
        dialog.className = "platform-alert";
        dialog.setAttribute("role", "alertdialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.setAttribute("aria-describedby", "platformRatingAlertMessage");

        dialog.innerHTML =
            '<p class="platform-alert__message" id="platformRatingAlertMessage">' + message + '</p>' +
            '<div class="platform-alert__actions">' +
            '<button type="button" class="platform-alert__ok" id="platformRatingAlertOk">OK</button>' +
            '</div>';

        backdrop.appendChild(dialog);
        document.body.appendChild(backdrop);

        var ok = document.getElementById("platformRatingAlertOk");
        function closeAlert() {
            backdrop.remove();
        }

        ok.addEventListener("click", closeAlert);
        backdrop.addEventListener("click", function (event) {
            if (event.target === backdrop) {
                closeAlert();
            }
        });

        ok.focus();
    }

    function showRatingMessage(value) {
        if (!value || Number(value) <= 0) return;
        showPlatformRatingAlert(value);
    }

    if (ratingStars) {
        var starNodes = Array.prototype.slice.call(ratingStars.querySelectorAll(".star-btn"));
        var previewValue = 0;
        var hovering = false;

        function currentRating() {
            return Number(ratingStars.getAttribute("data-rating")) || 0;
        }

        function roundHalf(value) {
            return Math.round(value * 2) / 2;
        }

        function valueFromClientX(clientX) {
            var first = starNodes[0].getBoundingClientRect();
            var last = starNodes[starNodes.length - 1].getBoundingClientRect();
            var isRtl = (document.documentElement.getAttribute("dir") || "").toLowerCase() === "rtl";
            var start = isRtl ? last.left : first.left;
            var end = isRtl ? first.right : last.right;
            var total = end - start;
            if (total <= 0) {
                return 0;
            }

            var ratio = (clientX - start) / total;
            ratio = Math.max(0, Math.min(1, ratio));
            if (isRtl) {
                ratio = 1 - ratio;
            }

            /* 10 أنصاف = 0.5 … 5.0 */
            var steps = starNodes.length * 2;
            var step = Math.ceil(ratio * steps);
            step = Math.max(1, Math.min(steps, step));
            return step / 2;
        }

        function paintStars(value) {
            value = roundHalf(Math.max(0, Math.min(5, value)));
            previewValue = value;
            starNodes.forEach(function (star) {
                var v = Number(star.getAttribute("data-value"));
                var fill = 0;
                if (value >= v) {
                    fill = 100;
                } else if (value >= v - 0.5) {
                    fill = 50;
                }
                star.style.setProperty("--star-fill", fill + "%");
                star.setAttribute("aria-checked", value > 0 && Math.ceil(value) === v ? "true" : "false");
            });
            ratingStars.setAttribute("aria-valuenow", String(value));
            ratingStars.setAttribute("aria-valuetext", value ? value + " من 5" : "بدون تقييم");
        }

        ratingStars.setAttribute("aria-valuemin", "0");
        ratingStars.setAttribute("aria-valuemax", "5");

        ratingStars.addEventListener("pointermove", function (e) {
            if (!hovering && e.pointerType === "mouse") {
                hovering = true;
            }
            if (e.pointerType === "mouse" || e.buttons === 1) {
                paintStars(valueFromClientX(e.clientX));
            }
        });

        ratingStars.addEventListener("pointerenter", function (e) {
            hovering = true;
            paintStars(valueFromClientX(e.clientX));
        });

        ratingStars.addEventListener("pointerleave", function () {
            hovering = false;
            paintStars(currentRating());
        });

        ratingStars.addEventListener("click", function (e) {
            var value = valueFromClientX(e.clientX);
            ratingStars.setAttribute("data-rating", String(value));
            paintStars(value);
        });

        starNodes.forEach(function (star) {
            star.addEventListener("keydown", function (e) {
                var value = currentRating() || 0;
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    value = Math.min(5, value + 0.5);
                    ratingStars.setAttribute("data-rating", String(value));
                    paintStars(value);
                    starNodes[Math.min(Math.ceil(value) - 1, starNodes.length - 1)].focus();
                } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    value = Math.max(0, value - 0.5);
                    ratingStars.setAttribute("data-rating", String(value));
                    paintStars(value);
                    if (value > 0) {
                        starNodes[Math.max(Math.ceil(value) - 1, 0)].focus();
                    }
                } else if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    var commit = previewValue || Number(star.getAttribute("data-value"));
                    ratingStars.setAttribute("data-rating", String(commit));
                    paintStars(commit);
                } else if (e.key === "Home") {
                    e.preventDefault();
                    ratingStars.setAttribute("data-rating", "0.5");
                    paintStars(0.5);
                } else if (e.key === "End") {
                    e.preventDefault();
                    ratingStars.setAttribute("data-rating", "5");
                    paintStars(5);
                }
            });
        });

        paintStars(currentRating());
    }

    /* ===== رفع الملفات ===== */
    (function initUploaders() {
        var storedFiles = {};

        function formatSize(bytes) {
            if (bytes < 1024) {
                return bytes + " B";
            }
            if (bytes < 1024 * 1024) {
                return (bytes / 1024).toFixed(1) + " KB";
            }
            return (bytes / (1024 * 1024)).toFixed(1) + " MB";
        }

        function getConfig(zone) {
            var formats = String(zone.getAttribute("data-formats") || "pdf")
                .split(",")
                .map(function (item) {
                    return item.trim().toLowerCase().replace(/^\./, "");
                })
                .filter(Boolean);
            return {
                multiple: zone.getAttribute("data-multiple") === "true",
                maxFiles: Number(zone.getAttribute("data-max-files") || 1),
                maxSize: Number(zone.getAttribute("data-max-size") || 2097152),
                formats: formats
            };
        }

        function fileExt(name) {
            var parts = String(name || "").toLowerCase().split(".");
            return parts.length > 1 ? parts.pop() : "";
        }

        function validateFile(file, config) {
            if (config.formats.indexOf(fileExt(file.name)) === -1) {
                return "صيغة الملف غير مدعومة";
            }
            if (file.size > config.maxSize) {
                return "الملف يتجاوز 2 ميجابايت";
            }
            return "";
        }

        function applyFiles(input, files) {
            try {
                var dt = new DataTransfer();
                files.forEach(function (file) {
                    dt.items.add(file);
                });
                input.files = dt.files;
            } catch (err) {
                return;
            }
        }

        function sameFile(a, b) {
            return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
        }

        function renderFiles(id) {
            var input = document.getElementById(id);
            var zone = document.querySelector('[data-uploader="' + id + '"]');
            var list = document.querySelector('[data-file-list="' + id + '"]');
            if (!input || !zone || !list) {
                return;
            }
            var files = storedFiles[id] || [];
            zone.classList.toggle("has-file", files.length > 0);
            list.innerHTML = "";
            files.forEach(function (file, index) {
                var row = document.createElement("div");
                row.className = "uploader-file";
                row.innerHTML =
                    '<div class="uploader-file__meta">' +
                        '<span class="uploader-file__check" aria-hidden="true"></span>' +
                        '<span class="uploader-file__info">' +
                            '<strong class="uploader-file__name"></strong>' +
                            '<span class="uploader-file__size"></span>' +
                        "</span>" +
                    "</div>" +
                    '<button type="button" class="uploader-file__remove" aria-label="حذف الملف">' +
                        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
                    "</button>";
                row.querySelector(".uploader-file__name").textContent = file.name;
                row.querySelector(".uploader-file__size").textContent = formatSize(file.size);
                row.querySelector(".uploader-file__remove").addEventListener("click", function () {
                    storedFiles[id] = (storedFiles[id] || []).filter(function (_, i) {
                        return i !== index;
                    });
                    applyFiles(input, storedFiles[id]);
                    renderFiles(id);
                });
                list.appendChild(row);
            });
            if (files.length) {
                showError(id, false);
                zone.classList.remove("is-invalid");
            }
        }

        function addFiles(id, incoming) {
            var input = document.getElementById(id);
            var zone = document.querySelector('[data-uploader="' + id + '"]');
            var err = document.querySelector('[data-error-for="' + id + '"]');
            if (!input || !zone) {
                return;
            }
            var config = getConfig(zone);
            var current = config.multiple ? (storedFiles[id] || []).slice() : [];
            var message = "";
            Array.prototype.forEach.call(incoming, function (file) {
                if (current.length >= config.maxFiles) {
                    message = config.multiple
                        ? "تجاوزت الحد المسموح من الملفات"
                        : "يُسمح بملف واحد فقط";
                    return;
                }
                var invalid = validateFile(file, config);
                if (invalid) {
                    message = invalid;
                    return;
                }
                var exists = current.some(function (item) {
                    return sameFile(item, file);
                });
                if (!exists) {
                    current.push(file);
                }
            });
            storedFiles[id] = current;
            applyFiles(input, current);
            renderFiles(id);
            if (message && !current.length) {
                if (err) {
                    err.textContent = message;
                }
                showError(id, true);
            }
        }

        document.querySelectorAll(".uploader").forEach(function (zone) {
            var id = zone.getAttribute("data-uploader");
            var input = document.getElementById(id);
            if (!input) {
                return;
            }
            storedFiles[id] = [];

            zone.addEventListener("click", function (e) {
                if (e.target === input || e.target.closest(".uploader-file__remove")) {
                    return;
                }
                input.click();
            });
            zone.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    input.click();
                }
            });

            ["dragenter", "dragover"].forEach(function (evt) {
                zone.addEventListener(evt, function (e) {
                    e.preventDefault();
                    zone.classList.add("is-dragover");
                });
            });
            ["dragleave", "drop"].forEach(function (evt) {
                zone.addEventListener(evt, function (e) {
                    e.preventDefault();
                    zone.classList.remove("is-dragover");
                });
            });
            zone.addEventListener("drop", function (e) {
                var files = e.dataTransfer && e.dataTransfer.files;
                if (!files || !files.length) {
                    return;
                }
                addFiles(id, files);
            });

            input.addEventListener("change", function () {
                addFiles(id, input.files || []);
            });
            input.addEventListener("click", function (e) {
                e.stopPropagation();
            });
        });
    })();


    // رفع المرفقات كمجموعة واحدة مع توزيعها على الحقول المطلوبة
    (function () {
        var bulkInput = document.getElementById("bulkFilesInput");
        var bulkZone = document.getElementById("bulkUploader");
        var bulkStatus = document.getElementById("bulkUploadStatus");

        var pdfTargets = [
            "fileCommercial",
            "fileBuilding",
            "fileBank",
            "fileOwnerId",
            "fileSoil",
            "fileSketch",
            "filePumpLine"
        ];
        var imageTarget = "fileAerial";

        function clearBulkStatus() {
            if (bulkStatus) {
                bulkStatus.textContent = "";
                bulkStatus.className = "bulk-upload-status";
            }
        }

        function setInputFiles(input, files) {
            try {
                var dt = new DataTransfer();
                Array.prototype.forEach.call(files, function (file) {
                    dt.items.add(file);
                });
                input.files = dt.files;
                return true;
            } catch (err) {
                return false;
            }
        }

        function distributeBulkFiles(fileList) {
            clearBulkStatus();

            var pdfs = [];
            var images = [];
            Array.prototype.forEach.call(fileList, function (file) {
                var type = (file.type || "").toLowerCase();
                var name = file.name.toLowerCase();
                var isPdf = type === "application/pdf" || name.endsWith(".pdf");
                var isImage = /\.(jpg|jpeg|png)$/i.test(name) || type.indexOf("image/") === 0;

                if (isPdf) pdfs.push(file);
                else if (isImage) images.push(file);
            });

            var assigned = 0;
            pdfTargets.forEach(function (id, index) {
                var input = document.getElementById(id);
                if (!input || !pdfs[index]) return;
                if (setInputFiles(input, [pdfs[index]])) {
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                    assigned += 1;
                }
            });

            var aerialInput = document.getElementById(imageTarget);
            if (aerialInput && images.length) {
                if (setInputFiles(aerialInput, images)) {
                    aerialInput.dispatchEvent(new Event("change", { bubbles: true }));
                    assigned += 1;
                }
            }

            var ignoredPdf = Math.max(0, pdfs.length - pdfTargets.length);
            if (bulkStatus) {
                if (assigned > 0) {
                    bulkStatus.textContent = "تم توزيع " + assigned + " من الملفات على قائمة المرفقات.";
                    bulkStatus.className = "bulk-upload-status is-success";
                }
                if (ignoredPdf > 0) {
                    bulkStatus.textContent += " توجد ملفات PDF إضافية لم تُوزّع تلقائيًا.";
                    bulkStatus.className = "bulk-upload-status is-warning";
                }
            }
        }

        if (!bulkInput || !bulkZone) return;

        bulkZone.addEventListener("click", function (e) {
            if (e.target === bulkInput) return;
            bulkInput.click();
        });

        bulkZone.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                bulkInput.click();
            }
        });

        ["dragenter", "dragover"].forEach(function (evt) {
            bulkZone.addEventListener(evt, function (e) {
                e.preventDefault();
                bulkZone.classList.add("is-dragover");
            });
        });

        ["dragleave", "drop"].forEach(function (evt) {
            bulkZone.addEventListener(evt, function (e) {
                e.preventDefault();
                bulkZone.classList.remove("is-dragover");
            });
        });

        bulkZone.addEventListener("drop", function (e) {
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                distributeBulkFiles(e.dataTransfer.files);
            }
        });

        bulkInput.addEventListener("change", function () {
            if (bulkInput.files && bulkInput.files.length) {
                distributeBulkFiles(bulkInput.files);
            }
        });
    })();

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearErrors();

        var hasError = false;

        requiredFieldIds.forEach(function (id) {
            var el = document.getElementById(id);
            var ok = isFilled(el);
            showError(id, !ok);
            if (!ok) {
                hasError = true;
            }
        });

        if (pumps.length === 0) {
            showError("pumpsList", true);
            hasError = true;
        }

        if (hasError) {
            formMessage.className = "form-message error";
            formMessage.textContent = "يرجى تعبئة جميع الحقول المطلوبة وإضافة مضخة واحدة على الأقل.";
            var firstInvalid = form.querySelector(".is-invalid, .field-error.show");
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        formMessage.className = "form-message success";
        formMessage.textContent =
            "تم التحقق من الطلب بنجاح. عدد المضخات المضافة: " +
            pumps.length +
            ". (عرض تجريبي — لا يوجد إرسال لخادم حالياً)";
        formMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    backBtn.addEventListener("click", function () {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });

    renderPumps();

    /* ===== القوائم المنسدلة الأنيقة ===== */
    (function initMenuSelects() {
        var caretSvg =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

        function closeAll(except) {
            document.querySelectorAll(".menu-select.is-open").forEach(function (el) {
                if (el !== except) {
                    el.classList.remove("is-open");
                    var selectEl = el.querySelector("select.form-select");
                    if (selectEl) {
                        selectEl.setAttribute("aria-expanded", "false");
                    }
                }
            });
        }

        function toggleOpen(wrap, select, panel, forceOpen) {
            var willOpen = typeof forceOpen === "boolean" ? forceOpen : !wrap.classList.contains("is-open");
            closeAll(wrap);
            wrap.classList.toggle("is-open", willOpen);
            select.setAttribute("aria-expanded", willOpen ? "true" : "false");
            if (willOpen) {
                buildOptions(select, panel);
            }
        }

        function buildOptions(select, panel) {
            panel.innerHTML = "";
            Array.prototype.forEach.call(select.options, function (opt) {
                if (opt.disabled && !opt.value) {
                    return;
                }
                var item = document.createElement("button");
                item.type = "button";
                item.className = "menu-select__option";
                item.setAttribute("data-value", opt.value || opt.textContent);
                item.innerHTML =
                    '<span class="menu-select__option-label"></span>' +
                    '<span class="menu-select__check" aria-hidden="true">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 9.5 17 19 7"/></svg>' +
                    "</span>";
                item.querySelector(".menu-select__option-label").textContent = opt.textContent;
                if (opt.selected && (opt.value || opt.textContent)) {
                    item.classList.add("is-active");
                }
                item.addEventListener("click", function () {
                    var val = item.getAttribute("data-value");
                    select.value = val;
                    if (select.value !== val) {
                        Array.prototype.forEach.call(select.options, function (o) {
                            o.selected = o.textContent === item.textContent;
                        });
                    }
                    select.dispatchEvent(new Event("change", { bubbles: true }));
                    panel.querySelectorAll(".menu-select__option").forEach(function (o) {
                        o.classList.remove("is-active");
                    });
                    item.classList.add("is-active");
                    toggleOpen(select.closest(".menu-select"), select, panel, false);
                    showError(select.id, false);
                });
                panel.appendChild(item);
            });
        }

        document.querySelectorAll("select.form-select").forEach(function (select) {
            if (select.closest(".menu-select")) {
                return;
            }

            var wrap = select.parentElement;
            if (!wrap || !wrap.classList.contains("field-wrap")) {
                wrap = document.createElement("div");
                wrap.className = "field-wrap";
                select.parentNode.insertBefore(wrap, select);
                wrap.appendChild(select);
            }

            wrap.classList.add("menu-select");
            select.setAttribute("aria-expanded", "false");
            select.setAttribute("aria-haspopup", "listbox");

            var caret = document.createElement("span");
            caret.className = "menu-select__caret";
            caret.setAttribute("aria-hidden", "true");
            caret.innerHTML = caretSvg;

            var panel = document.createElement("div");
            panel.className = "menu-select__panel";
            panel.setAttribute("role", "listbox");
            panel.id = select.id + "MenuPanel";
            select.setAttribute("aria-controls", panel.id);

            buildOptions(select, panel);
            wrap.appendChild(caret);
            wrap.appendChild(panel);

            select.addEventListener("mousedown", function (e) {
                e.preventDefault();
                toggleOpen(wrap, select, panel);
            });

            select.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                    e.preventDefault();
                    if (!wrap.classList.contains("is-open")) {
                        toggleOpen(wrap, select, panel, true);
                    }
                }
            });

            caret.addEventListener("mousedown", function (e) {
                e.preventDefault();
                e.stopPropagation();
                toggleOpen(wrap, select, panel);
            });
        });

        document.addEventListener("click", function (e) {
            if (!e.target.closest(".menu-select")) {
                closeAll(null);
            }
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                closeAll(null);
            }
        });
    })();

    /* ===== القائمة العلوية ===== */
    (function initTopNav() {
        var toggle = document.getElementById("navToggleBtn");
        var nav = document.getElementById("siteNav");
        if (!toggle || !nav) {
            return;
        }

        function closeSubmenus(except) {
            nav.querySelectorAll(".site-nav__item--has-menu").forEach(function (item) {
                if (item !== except) {
                    item.classList.remove("site-nav__item--open");
                    var btn = item.querySelector(".site-nav__trigger");
                    if (btn) {
                        btn.setAttribute("aria-expanded", "false");
                    }
                }
            });
        }

        function closeNav() {
            document.body.classList.remove("nav-open");
            toggle.setAttribute("aria-expanded", "false");
            closeSubmenus(null);
        }

        toggle.addEventListener("click", function () {
            var open = !document.body.classList.contains("nav-open");
            document.body.classList.toggle("nav-open", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            if (!open) {
                closeSubmenus(null);
            }
        });

        nav.querySelectorAll(".site-nav__trigger").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var item = btn.closest(".site-nav__item--has-menu");
                var willOpen = !item.classList.contains("site-nav__item--open");
                closeSubmenus(item);
                item.classList.toggle("site-nav__item--open", willOpen);
                btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
            });
        });

        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeNav);
        });

        document.addEventListener("click", function (e) {
            if (!e.target.closest(".site-nav__item--has-menu")) {
                closeSubmenus(null);
            }
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                closeNav();
            }
        });
    })();

    /* ===== روابط داخل الصفحة (تجنب تحذير file://) ===== */
    document.addEventListener("click", function (e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link) {
            return;
        }
        var href = link.getAttribute("href");
        if (!href || href === "#") {
            return;
        }
        var id = href.slice(1);
        var target = document.getElementById(id);
        if (!target) {
            return;
        }
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (window.location.protocol !== "file:") {
            try {
                history.replaceState(null, "", "#" + id);
            } catch (err) {
                /* ignore */
            }
        }
    });

    /* ===== تحميل الخريطة عند الظهور ===== */
    (function initLazyMap() {
        var frame = document.querySelector(".map-frame iframe[data-src]");
        if (!frame) {
            return;
        }
        function loadMap() {
            if (frame.getAttribute("src") && frame.getAttribute("src") !== "about:blank") {
                return;
            }
            frame.setAttribute("src", frame.getAttribute("data-src"));
        }
        if ("IntersectionObserver" in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        loadMap();
                        observer.disconnect();
                    }
                });
            }, { rootMargin: "200px" });
            observer.observe(frame);
        } else {
            loadMap();
        }
    })();

    /* ===== تقويم بداية الضخ ===== */
    (function initDatePicker() {
        var input = document.getElementById("pumpingStart");
        if (!input || typeof flatpickr === "undefined") {
            return;
        }

        var arLocale = (flatpickr.l10ns && flatpickr.l10ns.ar) ? flatpickr.l10ns.ar : {};
        flatpickr(input, {
            locale: Object.assign({}, arLocale, {
                weekdays: {
                    shorthand: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
                    longhand: arLocale.weekdays ? arLocale.weekdays.longhand : ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
                }
            }),
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "j F Y",
            disableMobile: true,
            allowInput: false,
            monthSelectorType: "static",
            onReady: function (selectedDates, dateStr, instance) {
                if (instance.altInput) {
                    instance.altInput.classList.add("form-control", "date-input");
                    instance.altInput.setAttribute("placeholder", "اختر التاريخ");
                    instance.altInput.removeAttribute("required");
                    instance.altInput.setAttribute("aria-label", "بداية الضخ");
                }
            },
            onChange: function () {
                showError("pumpingStart", false);
            }
        });
    })();

    /* ===== العودة لأعلى ===== */
    var scrollTopBtn = document.getElementById("scrollTopBtn");
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener("click", function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
    /* ===== الشريط الحكومي ===== */
    (function initGovBar() {
        var govBar = document.getElementById("govBar");
        var govButton = document.getElementById("govBarCheck");
        var govDetails = document.getElementById("govBarDetails");
        if (!govBar || !govButton || !govDetails) {
            return;
        }
        govButton.addEventListener("click", function () {
            var open = govBar.classList.toggle("is-open");
            govButton.setAttribute("aria-expanded", open ? "true" : "false");
            govDetails.hidden = !open;
        });
    })();

})();
