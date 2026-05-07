import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import moment from 'moment';

// Export complaints to PDF
export const exportToPDF = (complaints, filename = 'complaints') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Techyogi Automation - Complaint Report', 14, 22);

  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${moment().format('MMMM DD, YYYY HH:mm')}`, 14, 30);

  // Prepare data
  const tableData = complaints.map((complaint) => [
    complaint.complaintId,
    complaint.fullName,
    complaint.phoneNumber,
    complaint.serviceType?.join(', ') || '',
    complaint.priority,
    complaint.status,
    moment(complaint.createdAt).format('MMM DD, YYYY'),
  ]);

  // Add table
  doc.autoTable({
    head: [['ID', 'Customer', 'Phone', 'Service', 'Priority', 'Status', 'Date']],
    body: tableData,
    startY: 35,
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [2, 132, 199], // primary-600
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Techyogi Automation - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`${filename}_${moment().format('YYYYMMDD')}.pdf`);
};

// Export complaints to Excel
export const exportToExcel = (complaints, filename = 'complaints') => {
  // Prepare data
  const data = complaints.map((complaint) => ({
    'Complaint ID': complaint.complaintId,
    'Customer Name': complaint.fullName,
    'Phone Number': complaint.phoneNumber,
    'Alternate Phone': complaint.alternatePhone || '',
    'Company/Shop': complaint.companyName,
    'Address': complaint.address,
    'Service Type': complaint.serviceType?.join(', ') || '',
    'Priority': complaint.priority,
    'Status': complaint.status,
    'Message': complaint.message,
    'Assigned To': complaint.assignedTo || '',
    'Created At': moment(complaint.createdAt).format('YYYY-MM-DD HH:mm'),
    'Completed At': complaint.completedAt
      ? moment(complaint.completedAt).format('YYYY-MM-DD HH:mm')
      : '',
    'Notes': complaint.notes || '',
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 20 }, // ID
    { wch: 25 }, // Name
    { wch: 15 }, // Phone
    { wch: 15 }, // Alt Phone
    { wch: 25 }, // Company
    { wch: 40 }, // Address
    { wch: 30 }, // Service
    { wch: 10 }, // Priority
    { wch: 12 }, // Status
    { wch: 50 }, // Message
    { wch: 20 }, // Assigned To
    { wch: 20 }, // Created
    { wch: 20 }, // Completed
    { wch: 40 }, // Notes
  ];
  ws['!cols'] = colWidths;

  // Add sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Complaints');

  // Save
  XLSX.writeFile(wb, `${filename}_${moment().format('YYYYMMDD')}.xlsx`);
};

// Export single complaint detail to PDF
export const exportComplaintDetail = (complaint) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(2, 132, 199);
  doc.text('Complaint Details', 14, 20);

  // Complaint ID
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Complaint ID: ${complaint.complaintId}`, 14, 30);

  let y = 45;

  // Customer Info
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('Customer Information', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Name: ${complaint.fullName}`, 14, y);
  y += 6;
  doc.text(`Phone: ${complaint.phoneNumber}`, 14, y);
  y += 6;
  if (complaint.alternatePhone) {
    doc.text(`Alternate: ${complaint.alternatePhone}`, 14, y);
    y += 6;
  }
  doc.text(`Company/Shop: ${complaint.companyName}`, 14, y);
  y += 6;
  doc.text(`Address: ${complaint.address}`, 14, y);
  y += 12;

  // Complaint Info
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('Complaint Information', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Service Type: ${complaint.serviceType?.join(', ') || ''}`, 14, y);
  y += 6;
  doc.text(`Priority: ${complaint.priority}`, 14, y);
  y += 6;
  doc.text(`Status: ${complaint.status}`, 14, y);
  y += 6;
  doc.text(`Created: ${moment(complaint.createdAt).format('MMMM DD, YYYY HH:mm')}`, 14, y);
  y += 6;
  if (complaint.completedAt) {
    doc.text(`Completed: ${moment(complaint.completedAt).format('MMMM DD, YYYY HH:mm')}`, 14, y);
    y += 6;
  }
  if (complaint.assignedTo) {
    doc.text(`Assigned To: ${complaint.assignedTo}`, 14, y);
    y += 6;
  }
  y += 12;

  // Message
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('Message', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(0);
  const splitMessage = doc.splitTextToSize(complaint.message, 180);
  doc.text(splitMessage, 14, y);
  y += splitMessage.length * 6 + 12;

  // Timeline
  if (complaint.timeline && complaint.timeline.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Timeline', 14, y);
    y += 8;

    const timelineData = complaint.timeline.map((item) => [
      moment(item.updatedAt).format('MMM DD, HH:mm'),
      item.status,
      item.note,
      item.updatedBy,
    ]);

    doc.autoTable({
      head: [['Date', 'Status', 'Note', 'By']],
      body: timelineData,
      startY: y,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [2, 132, 199], textColor: 255 },
    });
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(
    'Techyogi Automation - Smart Security, Always On',
    doc.internal.pageSize.getWidth() / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`complaint_${complaint.complaintId}_${moment().format('YYYYMMDD')}.pdf`);
};
