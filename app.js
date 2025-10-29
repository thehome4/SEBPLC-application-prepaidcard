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

        // Validate required fields
        const requiredFields = ['fullName', 'fatherName', 'motherName', 'dob', 'nid', 'presentAddress', 'permanentAddress', 'cellPhone', 'email'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                isValid = false;
                element.style.borderColor = '#e74c3c';
            } else {
                element.style.borderColor = '';
            }
        });

        if (!isValid) {
            alert('Please fill in all required fields.');
            return;
        }

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

            // Create PDF document
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const margin = 15;
            let yPosition = margin;

            // Try to add logo
            try {
                const logoImg = document.querySelector('.seblogo');
                if (logoImg && logoImg.complete && logoImg.naturalWidth !== 0) {
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
                } else {
                    throw new Error('Logo not loaded');
                }
            } catch (e) {
                // Fallback without logo
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

            // Add form data
            const fields = [
                `Full Name: ${fullName}`,
                `Father's Name: ${fatherName}`,
                `Mother's Name: ${motherName}`,
                `Date of Birth: ${dob}`,
                `NID Number: ${nid}`,
                `Present Address: ${presentAddress}`,
                `Permanent Address: ${permanentAddress}`,
                `Cell Phone: ${cellPhone}`,
                `Email: ${email}`
            ];

            fields.forEach(field => {
                if (field.startsWith('Present Address:') || field.startsWith('Permanent Address:')) {
                    const lines = doc.splitTextToSize(field, 180 - margin * 2);
                    if (yPosition + (7 * lines.length) > 270) {
                        doc.addPage();
                        yPosition = margin;
                    }
                    doc.text(lines, margin, yPosition);
                    yPosition += 7 * lines.length;
                } else {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = margin;
                    }
                    doc.text(field, margin, yPosition);
                    yPosition += 7;
                }
            });

            yPosition += 5;

            // Add terms and signature section
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
            const terms = [
                "To: Southeast Bank PLC.",
                "I hereby apply for the Southeast Bank Prepaid Card as specified above. I hereby solemnly",
                "declare and affirm as follows:",
                "I have read and understood the terms and conditions of the Southeast Bank Prepaid Card",
                "Terms & Conditions printed on the reverse side of the application form."
            ];

            terms.forEach(term => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(term, margin, yPosition);
                yPosition += 7;
            });

            yPosition += 10;

            // Card number boxes
            if (yPosition > 250) {
                doc.addPage();
                yPosition = margin;
            }

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

            yPosition += 25;

            // Signature line
            doc.text("Signature:", margin, yPosition);
            yPosition += 5;
            doc.line(margin, yPosition, margin + 80, yPosition);
            yPosition += 10;

            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text("(Sign manually with pen after printing)", margin, yPosition);

            // Generate PDF bytes
            const applicationPdfBytes = doc.output('arraybuffer');
            let finalPdfBytes = applicationPdfBytes;

            // Handle NID attachment if provided
            if (nidAttachment.files.length > 0) {
                try {
                    const nidFile = nidAttachment.files[0];
                    const nidFileType = nidFile.type;

                    if (nidFileType === 'application/pdf') {
                        // Merge PDF files
                        const nidPdfBytes = await readFileAsArrayBuffer(nidFile);
                        const mergedPdf = await PDFLib.PDFDocument.create();
                        const appPdfDoc = await PDFLib.PDFDocument.load(applicationPdfBytes);
                        const appPages = await mergedPdf.copyPages(appPdfDoc, appPdfDoc.getPageIndices());
                        appPages.forEach(page => mergedPdf.addPage(page));
                        
                        const nidPdfDoc = await PDFLib.PDFDocument.load(nidPdfBytes);
                        const nidPages = await mergedPdf.copyPages(nidPdfDoc, nidPdfDoc.getPageIndices());
                        nidPages.forEach(page => mergedPdf.addPage(page));
                        
                        finalPdfBytes = await mergedPdf.save();

                    } else if (nidFileType.startsWith('image/')) {
                        // Convert image to PDF and merge
                        const nidImageBytes = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(nidFile);
                        });

                        const imgPdf = new jsPDF({
                            orientation: 'portrait',
                            unit: 'mm',
                            format: 'a4'
                        });

                        const pageWidth = imgPdf.internal.pageSize.getWidth();
                        const pageHeight = imgPdf.internal.pageSize.getHeight();

                        // Add image to fill the page
                        imgPdf.addImage(nidImageBytes, 'JPEG', 0, 0, pageWidth, pageHeight);
                        const imgPdfBytes = imgPdf.output('arraybuffer');

                        // Merge with application PDF
                        const mergedPdf = await PDFLib.PDFDocument.create();
                        const appPdfDoc = await PDFLib.PDFDocument.load(applicationPdfBytes);
                        const appPages = await mergedPdf.copyPages(appPdfDoc, appPdfDoc.getPageIndices());
                        appPages.forEach(page => mergedPdf.addPage(page));
                        
                        const nidPdfDoc = await PDFLib.PDFDocument.load(imgPdfBytes);
                        const nidPages = await mergedPdf.copyPages(nidPdfDoc, nidPdfDoc.getPageIndices());
                        nidPages.forEach(page => mergedPdf.addPage(page));
                        
                        finalPdfBytes = await mergedPdf.save();
                    }
                } catch (mergeError) {
                    console.error('Error merging NID attachment:', mergeError);
                    // Continue with just the application PDF if merge fails
                    finalPdfBytes = applicationPdfBytes;
                }
            }

            updateStep(3, 'active');

            // Convert to base64 for upload
            const base64Pdf = arrayBufferToBase64(finalPdfBytes);
            const dataUrl = `data:application/pdf;base64,${base64Pdf}`;

            // Upload to Google Drive with all parameters
            const driveLink = await uploadToGoogleDrive(dataUrl, filename, fullName, cellPhone);

            updateStep(4, 'active');

            // Mark all steps as completed
            updateStep(1, 'completed');
            updateStep(2, 'completed');
            updateStep(3, 'completed');
            updateStep(4, 'completed');

            // Show success message
            document.getElementById('success-message').style.display = 'block';

            // Open WhatsApp with pre-filled message
            const message = `Application for Prepaid Card%0AName: ${fullName}%0AContact: ${cellPhone}%0APDF Link: ${encodeURIComponent(driveLink)}`;
            window.location.href = `https://wa.me/8801614413265?text=${message}`;

        } catch (error) {
            console.error('Error in form submission:', error);
            alert('An error occurred while processing your application. Please try again.');
            hideProcessingAnimation();
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
            
            // Reset steps on error
            updateStep(1, 'completed');
            updateStep(2, 'pending');
            updateStep(3, 'pending');
            updateStep(4, 'pending');
        }
    });

    // Utility function to read file as ArrayBuffer
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // Utility function to convert ArrayBuffer to Base64
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }


// Updated uploadToGoogleDrive function to handle JSON responses
async function uploadToGoogleDrive(dataUrl, filename, fullName, cellPhone) {
    try {
        const data = new URLSearchParams();
        data.append("file", dataUrl);
        data.append("filename", filename);
        data.append("fullName", fullName);
        data.append("cellPhone", cellPhone);

        const scriptURL = "https://script.google.com/macros/s/AKfycbxOzWorsLyiFvXl7Klsvzh5Ugu8tByYd9Px6OTvkjjSFf5_TPZJUixTrKWeqxWdcDGLqQ/exec";

        const response = await fetch(scriptURL, { 
            method: "POST", 
            body: data 
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === "success") {
            return result.downloadLink;
        } else {
            throw new Error(result.message || "Upload failed");
        }
    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        throw error;
    }
}

    // Function to show processing animation
    function showProcessingAnimation() {
        updateStep(1, 'completed');
        updateStep(2, 'active');
        updateStep(3, 'pending');
        updateStep(4, 'pending');
        processingOverlay.style.display = 'flex';
    }

    // Function to hide processing animation
    function hideProcessingAnimation() {
        processingOverlay.style.display = 'none';
    }

    // Function to update step status
    function updateStep(stepNumber, status) {
        const icon = document.getElementById(`step${stepNumber}-icon`);
        const text = document.getElementById(`step${stepNumber}-text`);
        
        if (!icon || !text) return;
        
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
