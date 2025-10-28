// Initialize jsPDF
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
    // File upload handling
    const nidUploadArea = document.getElementById('nidUploadArea');
    const nidAttachment = document.getElementById('nidAttachment');
    const nidFileName = document.getElementById('nidFileName');
    const fileSizeWarning = document.getElementById('fileSizeWarning');
    const processingOverlay = document.getElementById('processing-overlay');
    const submitButton = document.querySelector('button[type="submit"]');

    nidUploadArea.addEventListener('click', function() {
        nidAttachment.click();
    });

    nidAttachment.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const fileName = file.name;
            const fileSize = file.size;
            const maxSize = 10 * 1024 * 1024;

            if (fileSize > maxSize) {
                fileSizeWarning.style.display = 'block';
                nidFileName.textContent = '';
                nidFileName.style.color = '#e74c3c';
                nidFileName.textContent = 'File too large: ' + (fileSize / (1024*1024)).toFixed(2) + 'MB';
                nidAttachment.value = '';
            } else {
                fileSizeWarning.style.display = 'none';
                nidFileName.style.color = 'var(--primary-color)';
                nidFileName.textContent = fileName + ' (' + (fileSize / 1024).toFixed(2) + 'KB)';
            }
        }
    });

    // Form submission
    document.getElementById('application-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (nidAttachment.files.length > 0) {
            const fileSize = nidAttachment.files[0].size;
            const maxSize = 10 * 1024 * 1024;

            if (fileSize > maxSize) {
                alert('Please select a file smaller than 10MB.');
                return;
            }
        }

        showProcessingAnimation();
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';
        submitButton.style.cursor = 'not-allowed';

        document.getElementById('success-message').style.display = 'none';

        try {
            updateStep(2, 'active');

            const fullName = document.getElementById('fullName').value;
            const fatherName = document.getElementById('fatherName').value;
            const motherName = document.getElementById('motherName').value;
            const dob = document.getElementById('dob').value;
            const nid = document.getElementById('nid').value;
            const presentAddress = document.getElementById('presentAddress').value;
            const permanentAddress = document.getElementById('permanentAddress').value;
            const cellPhone = document.getElementById('cellPhone').value;
            const email = document.getElementById('email').value;

            const filename = `SEBPLC_Application_${cellPhone || 'unknown'}.pdf`;

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const margin = 15;
            let yPosition = margin;

            try {
                const logoImg = document.querySelector('.seblogo');
                const logoData = logoImg.src;
                const originalWidth = 600;
                const originalHeight = 154;
                const aspectRatio = originalHeight / originalWidth;
                const logoWidth = 50;
                const logoHeight = logoWidth * aspectRatio;

                doc.addImage(logoData, 'PNG', margin, 10, logoWidth, logoHeight);
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.setFont(undefined, 'bold');
                doc.text("APPLICATION FOR PREPAID CARD", margin + logoWidth + 5, 15);

                yPosition = Math.max(40, 10 + logoHeight + 5);
            } catch (e) {
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.setFont(undefined, 'bold');
                doc.text("SOUTHEAST BANK PLC", 105, 15, { align: 'center' });
                doc.setFontSize(12);
                doc.text("APPLICATION FOR PREPAID CARD", 105, 22, { align: 'center' });
                yPosition = 30;
            }

            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("APPLICATION DETAILS", margin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');

            doc.text(`Full Name: ${fullName}`, margin, yPosition);
            yPosition += 7;
            doc.text(`Father's Name: ${fatherName}`, margin, yPosition);
            yPosition += 7;
            doc.text(`Mother's Name: ${motherName}`, margin, yPosition);
            yPosition += 7;
            doc.text(`Date of Birth: ${dob}`, margin, yPosition);
            yPosition += 7;
            doc.text(`NID Number: ${nid}`, margin, yPosition);
            yPosition += 7;

            if (yPosition > 250) {
                doc.addPage();
                yPosition = margin;
            }

            const presentAddressLines = doc.splitTextToSize(`Present Address: ${presentAddress}`, 180 - margin * 2);
            doc.text(presentAddressLines, margin, yPosition);
            yPosition += 7 * presentAddressLines.length;

            const permanentAddressLines = doc.splitTextToSize(`Permanent Address: ${permanentAddress}`, 180 - margin * 2);
            doc.text(permanentAddressLines, margin, yPosition);
            yPosition += 7 * permanentAddressLines.length;

            doc.text(`Cell Phone: ${cellPhone}`, margin, yPosition);
            yPosition += 7;
            doc.text(`Email: ${email}`, margin, yPosition);
            yPosition += 10;

            if (yPosition > 250) {
                doc.addPage();
                yPosition = margin;
            }

            doc.setFillColor(243, 65, 75);
            doc.rect(margin, yPosition, 180, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text("PLEASE READ THE MEMBERSHIP AGREEMENT AND SIGN ACCORDINGLY BELOW", 105, yPosition + 6, { align: 'center' });
            yPosition += 15;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.text("To: Southeast Bank PLC.", margin, yPosition);
            yPosition += 7;
            doc.text("I hereby apply for the Southeast Bank Prepaid Card as specified above. I hereby solemnly", margin, yPosition);
            yPosition += 7;
            doc.text("declare and affirm as follows:", margin, yPosition);
            yPosition += 7;
            doc.text("I have read and understood the terms and conditions of the Southeast Bank Prepaid Card", margin, yPosition);
            yPosition += 7;
            doc.text("Terms & Conditions printed on the reverse side of the application form.", margin, yPosition);
            yPosition += 15;

            doc.text("Card Number:", margin, yPosition);
            yPosition += 5;

            doc.setDrawColor(0);
            doc.setLineWidth(0.5);

            let boxWidth = 9;
            let boxHeight = 10;
            let totalBoxes = 16;
            let spacing = 2;

            for (let i = 0; i < totalBoxes; i++) {
              doc.rect(margin + (i * (boxWidth + spacing)), yPosition, boxWidth, boxHeight);
            }

            yPosition += 40;

            doc.text("Signature:", margin, yPosition);
            yPosition += 5;
            doc.line(margin, yPosition, margin + 80, yPosition);
            yPosition += 10;

            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text("(Sign manually with pen after printing)", margin, yPosition);

            const applicationPdfBytes = doc.output('arraybuffer');
            let finalPdfBytes;

            if (nidAttachment.files.length > 0) {
                const nidFile = nidAttachment.files[0];
                const nidFileType = nidFile.type;

                if (nidFileType === 'application/pdf') {
                    const nidPdfBytes = await readFileAsArrayBuffer(nidFile);
                    const mergedPdf = await PDFLib.PDFDocument.create();
                    const appPdfDoc = await PDFLib.PDFDocument.load(applicationPdfBytes);
                    const appPages = await mergedPdf.copyPages(appPdfDoc, appPdfDoc.getPageIndices());
                    appPages.forEach(page => mergedPdf.addPage(page));
                    const nidPdfDoc = await PDFLib.PDFDocument.load(nidPdfBytes);
                    const nidPages = await mergedPdf.copyPages(nidPdfDoc, nidPdfDoc.getPageIndices());
                    nidPages.forEach(page => mergedPdf.addPage(page));
                    finalPdfBytes = await mergedPdf.save();

                } else if (nidFileType === 'image/jpeg' || nidFileType === 'image/png') {
                    const nidPdfBytes = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = async function(e) {
                            const imgData = e.target.result;
                            const imgPdf = new jsPDF();
                            const imgProps = imgPdf.getImageProperties(imgData);
                            const pdfWidth = imgPdf.internal.pageSize.getWidth();
                            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                            imgPdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                            const imgPdfBytes = imgPdf.output('arraybuffer');

                            const mergedPdf = await PDFLib.PDFDocument.create();
                            const appPdfDoc = await PDFLib.PDFDocument.load(applicationPdfBytes);
                            const appPages = await mergedPdf.copyPages(appPdfDoc, appPdfDoc.getPageIndices());
                            appPages.forEach(page => mergedPdf.addPage(page));
                            const nidPdfDoc = await PDFLib.PDFDocument.load(imgPdfBytes);
                            const nidPages = await mergedPdf.copyPages(nidPdfDoc, nidPdfDoc.getPageIndices());
                            nidPages.forEach(page => mergedPdf.addPage(page));
                            const mergedPdfBytes = await mergedPdf.save();
                            resolve(mergedPdfBytes);
                        };
                        reader.readAsDataURL(nidFile);
                    });
                    finalPdfBytes = nidPdfBytes;
                }
            } else {
                finalPdfBytes = applicationPdfBytes;
            }

            updateStep(3, 'active');

            const base64Pdf = arrayBufferToBase64(finalPdfBytes);
            const dataUrl = `data:application/pdf;base64,${base64Pdf}`;

            const driveLink = await uploadToGoogleDrive(dataUrl, filename);

            updateStep(4, 'active');

            updateStep(1, 'completed');
            updateStep(2, 'completed');
            updateStep(3, 'completed');
            updateStep(4, 'completed');

            document.getElementById('success-message').style.display = 'block';

            // Directly open WhatsApp without any popup
            const message = `Application for Prepaid Card%0AName: ${fullName}%0AContact: ${cellPhone}%0APDF Link: ${encodeURIComponent(driveLink)}`;
            window.location.href = `https://wa.me/8801614413265?text=${message}`;

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('An error occurred while processing your application. Please try again.');
            hideProcessingAnimation();
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
        }
    });

    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    async function uploadToGoogleDrive(dataUrl, filename) {
        const data = new URLSearchParams();
        data.append("file", dataUrl);
        data.append("filename", filename);

        const scriptURL = "https://script.google.com/macros/s/AKfycbxgeD8rNVh_RkqOMqqphbL1PPg9ONcqlX5gnP_35M7kq9Cjvot82bHua01kbPtftz8/exec";

        const response = await fetch(scriptURL, { method: "POST", body: data });
        const link = await response.text();
        return link;
    }

    function showProcessingAnimation() {
        updateStep(1, 'completed');
        updateStep(2, 'active');
        updateStep(3, 'pending');
        updateStep(4, 'pending');
        processingOverlay.style.display = 'flex';
    }

    function hideProcessingAnimation() {
        processingOverlay.style.display = 'none';
    }

    function updateStep(stepNumber, status) {
        const icon = document.getElementById(`step${stepNumber}-icon`);
        const text = document.getElementById(`step${stepNumber}-text`);
        
        icon.classList.remove('fa-check-circle', 'fa-sync-alt', 'fa-circle', 'step-completed', 'step-active', 'step-pending');
        text.classList.remove('step-completed', 'step-active', 'step-pending');
        
        if (status === 'completed') {
            icon.classList.add('fa-check-circle', 'step-completed');
            text.classList.add('step-completed');
        } else if (status === 'active') {
            icon.classList.add('fa-sync-alt', 'step-active');
            text.classList.add('step-active');
        } else if (status === 'pending') {
            icon.classList.add('fa-circle', 'step-pending');
            text.classList.add('step-pending');
        }
    }
});
