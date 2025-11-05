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
let y = margin;

// === HEADER SECTION ===
try {
    const logoImg = document.querySelector('.seblogo');
    if (logoImg && logoImg.complete && logoImg.naturalWidth !== 0) {
        const logoData = logoImg.src;
        const logoWidth = 45;
        const logoHeight = (logoWidth * 154) / 600;
        doc.addImage(logoData, 'PNG', margin, y, logoWidth, logoHeight);
    }
} catch (e) {
    console.warn("Logo not loaded:", e);
}

doc.setFont("helvetica", "bold");
doc.setFontSize(16);
doc.setTextColor(33, 37, 41);
doc.text("SOUTHEAST BANK PLC", 105, y + 8, { align: "center" });
doc.setFontSize(12);
doc.text("APPLICATION FOR PREPAID CARD", 105, y + 15, { align: "center" });
y += 25;

// === SECTION A: Applicant Details ===
doc.setDrawColor(0);
doc.setFillColor(245, 247, 250);
doc.rect(margin, y, 180, 10, 'F');
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("SECTION A: Applicant Details", margin + 3, y + 7);
y += 15;

doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(0, 0, 0);

const fieldsData = [
    ["Full Name", fullName],
    ["Father's Name", fatherName],
    ["Mother's Name", motherName],
    ["Date of Birth", dob],
    ["NID Number", nid],
    ["Present Address", presentAddress],
    ["Permanent Address", permanentAddress],
    ["Cell Phone", cellPhone],
    ["Email", email]
];

fieldsData.forEach(([label, value]) => {
    if (y > 270) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value || "N/A", 130);
    doc.text(lines, margin + 45, y);
    y += 7 * lines.length;
});

y += 5;

// === SECTION B: Declaration & Agreement ===
if (y > 250) { doc.addPage(); y = margin; }

doc.setFillColor(243, 65, 75); // keep original blue color
doc.rect(margin, y, 180, 10, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(11);
doc.setFont("helvetica", "bold");
doc.text("SECTION B: Declaration & Agreement", 105, y + 6, { align: "center" });
y += 15;

doc.setTextColor(0, 0, 0);
doc.setFont("helvetica", "normal");
const terms = [
    "To: Southeast Bank PLC,",
    "I hereby apply for the Southeast Bank Prepaid Card as specified above and solemnly declare as follows:",
    "1. I have read, understood, and agree to abide by the Terms & Conditions of the Southeast Bank Prepaid Card.",
    "2. I certify that the information given above is true and correct to the best of my knowledge.",
    "3. I authorize the bank to verify any of the information contained in this application."
];
terms.forEach(line => {
    const lines = doc.splitTextToSize(line, 180);
    doc.text(lines, margin, y);
    y += 7 * lines.length;
});
y += 10;

// === CARD NUMBER ===
if (y > 250) { doc.addPage(); y = margin; }
doc.setFont("helvetica", "bold");
doc.text("Card Number:", margin, y);
y += 2;

doc.setDrawColor(0);
doc.setLineWidth(0.3);
const boxWidth = 9, boxHeight = 10, spacing = 2;
for (let i = 0; i < 16; i++) {
    doc.rect(margin + (i * (boxWidth + spacing)), y, boxWidth, boxHeight);
}
y += 29; // added extra margin below boxes for better spacing

// === SIGNATURE SECTION (Improved Alignment) ===
doc.setFont("helvetica", "bold");
doc.text("Applicant’s Signature:", margin, y);
doc.line(margin + 55, y + 2, margin + 130, y + 2);

doc.text("Date:", 150, y);
doc.line(160, y + 2, 195, y + 2);

y += 12;
doc.setFont("helvetica", "italic");
doc.setFontSize(9);
doc.setTextColor(100);
doc.text("(Sign manually with pen after printing)", margin + 55, y);
y += 15;


// === Generate PDF Bytes ===
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

        const scriptURL = "https://script.google.com/macros/s/AKfycbzHCnWrX3RHpJq3W-W2VcQn9VXxBbt_1lC29DS2Py6s36cmCKuVPmH23UBNzn7Du-j6Xw/exec";

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

