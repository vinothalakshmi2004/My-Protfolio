import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

pdf_path = r"client\public\resume.pdf"
os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

# 0.5 inch margins for clean professional layout
doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    leftMargin=36,
    rightMargin=36,
    topMargin=36,
    bottomMargin=36
)

styles = getSampleStyleSheet()

# Colors
primary_blue = colors.HexColor("#1d4ed8") # royal blue
header_dark = colors.HexColor("#0f172a")  # slate 900
text_dark = colors.HexColor("#1e293b")    # slate 800
text_muted = colors.HexColor("#475569")   # slate 600

# Custom typography styles
styles.add(ParagraphStyle(
    name='ResumeName',
    fontName='Helvetica-Bold',
    fontSize=18,
    leading=22,
    textColor=header_dark,
    alignment=1, # Center
))

styles.add(ParagraphStyle(
    name='ResumeTitle',
    fontName='Helvetica-Bold',
    fontSize=11,
    leading=15,
    textColor=primary_blue,
    alignment=1, # Center
    spaceAfter=4
))

styles.add(ParagraphStyle(
    name='ResumeContact',
    fontName='Helvetica',
    fontSize=8.5,
    leading=12,
    textColor=text_muted,
    alignment=1, # Center
    spaceAfter=6
))

styles.add(ParagraphStyle(
    name='SectionTitle',
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=13,
    textColor=primary_blue,
    spaceBefore=8,
    spaceAfter=4,
    textTransform='uppercase'
))

styles.add(ParagraphStyle(
    name='BodyTextCustom',
    fontName='Helvetica',
    fontSize=8.5,
    leading=11.5,
    textColor=text_dark,
    spaceAfter=4
))

styles.add(ParagraphStyle(
    name='BulletItem',
    fontName='Helvetica',
    fontSize=8.2,
    leading=11,
    textColor=text_dark,
    leftIndent=12,
    firstLineIndent=-8,
    spaceAfter=2
))

styles.add(ParagraphStyle(
    name='JobTitle',
    fontName='Helvetica-Bold',
    fontSize=9,
    leading=12,
    textColor=header_dark
))

styles.add(ParagraphStyle(
    name='JobDate',
    fontName='Helvetica',
    fontSize=8.5,
    leading=12,
    textColor=text_muted,
    alignment=2 # Right
))

styles.add(ParagraphStyle(
    name='SkillLabel',
    fontName='Helvetica-Bold',
    fontSize=8.5,
    leading=11.5,
    textColor=header_dark
))

styles.add(ParagraphStyle(
    name='SkillVal',
    fontName='Helvetica',
    fontSize=8.5,
    leading=11.5,
    textColor=text_dark
))

story = []

# ==================== PAGE 1 ====================
# Header
story.append(Paragraph("VINOTHALAKSHMI M", styles['ResumeName']))
story.append(Paragraph("MERN Stack Developer", styles['ResumeTitle']))
contact_info = "Madurai, Tamil Nadu &nbsp;|&nbsp; +91 8610257232 &nbsp;|&nbsp; vinothalakshmi7@gmail.com &nbsp;|&nbsp; www.linkedin.com/in/vinotha-lakshmi-m2004 &nbsp;|&nbsp; github.com/vinothalakshmi2004"
story.append(Paragraph(contact_info, styles['ResumeContact']))
story.append(HRFlowable(width="100%", thickness=1.5, color=primary_blue, spaceBefore=2, spaceAfter=8))

# Professional Summary
story.append(Paragraph("PROFESSIONAL SUMMARY", styles['SectionTitle']))
summary_text = (
    "MCA graduate with hands-on experience building MERN stack applications and a strong foundation in fullstack "
    "development. Skilled in React.js, Node.js, MongoDB, and REST APIs with real-world project experience in scalable "
    "web applications. Currently working as an AI Automation Engineer at ZenxAI, with a proven ability to learn fast, lead "
    "teams, and deliver quality software solutions."
)
story.append(Paragraph(summary_text, styles['BodyTextCustom']))
story.append(Spacer(1, 4))

# Technical Skills
story.append(Paragraph("TECHNICAL SKILLS", styles['SectionTitle']))
skills_data = [
    [Paragraph("Frontend", styles['SkillLabel']), Paragraph("React.js, HTML5, CSS3, JavaScript (ES6+)", styles['SkillVal'])],
    [Paragraph("Backend", styles['SkillLabel']), Paragraph("Node.js, Express.js, REST APIs, Java, Python", styles['SkillVal'])],
    [Paragraph("Database", styles['SkillLabel']), Paragraph("MongoDB, MySQL", styles['SkillVal'])],
    [Paragraph("DevOps / Tools", styles['SkillLabel']), Paragraph("Git, GitHub, Postman, VS Code, Slack, Canvas", styles['SkillVal'])],
    [Paragraph("Soft Skills", styles['SkillLabel']), Paragraph("Leadership, Team Management, Time Management, Multitasking", styles['SkillVal'])],
]
t_skills = Table(skills_data, colWidths=[90, 450])
t_skills.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
    ('TOPPADDING', (0,0), (-1,-1), 1.5),
    ('LEFTPADDING', (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 0),
]))
story.append(t_skills)
story.append(Spacer(1, 4))

# Work Experience
story.append(Paragraph("WORK EXPERIENCE", styles['SectionTitle']))

# Job 1: ZenXAI
j1_table = Table([[
    Paragraph("<b>AI Automation Engineer &amp; Quality Analyst</b> — ZenXAI", styles['JobTitle']),
    Paragraph("Jan 2026 – Present", styles['JobDate'])
]], colWidths=[380, 160])
j1_table.setStyle(TableStyle([
    ('LEFTPADDING', (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ('TOPPADDING', (0,0), (-1,-1), 2),
]))
story.append(j1_table)

story.append(Paragraph("• Developed and maintained AI voice agents and automation workflows to improve operational efficiency.", styles['BulletItem']))
story.append(Paragraph("• Worked with REST APIs, API keys, webhooks, and JSON for application integrations.", styles['BulletItem']))
story.append(Paragraph("• Performed API testing using Postman and Swagger; gained exposure to Docker and MERN stack technologies.", styles['BulletItem']))
story.append(Paragraph("• Conducted quality analysis, identified bugs, and troubleshot issues to improve system accuracy and reliability.", styles['BulletItem']))
story.append(Spacer(1, 4))

# Job 2: Cognifyz
j2_table = Table([[
    Paragraph("<b>Frontend Development Intern</b> — Cognifyz Technologies", styles['JobTitle']),
    Paragraph("Jul 2025 – Aug 2025", styles['JobDate'])
]], colWidths=[380, 160])
j2_table.setStyle(TableStyle([
    ('LEFTPADDING', (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ('TOPPADDING', (0,0), (-1,-1), 2),
]))
story.append(j2_table)
story.append(Paragraph("• Built responsive web interfaces using HTML, CSS, and JavaScript.", styles['BulletItem']))
story.append(Paragraph("• Improved UI design skills and coding practices through hands-on project work.", styles['BulletItem']))
story.append(Spacer(1, 4))

# Projects
story.append(Paragraph("PROJECTS", styles['SectionTitle']))

# Project 1
story.append(Paragraph(
    "<b>Smart Admission Management System</b> <font color='#1d4ed8'>(MERN Stack)</font> - "
    "Full-stack web application for online college admissions featuring scholarship eligibility check, "
    "seat availability tracking, live admission updates, secure authentication, REST APIs, and an admin dashboard "
    "for efficient admission management.",
    styles['BodyTextCustom']
))

# Project 2
story.append(Paragraph(
    "<b>NextStep Educational Consultancy System</b> <font color='#1d4ed8'>(MERN Stack)</font> - "
    "Web-based consultancy platform to assist students post-12th with course selection, college shortlisting, "
    "and application support. Built an interactive student interface and admin panel to manage inquiries, track admissions, "
    "and provide personalised career guidance.",
    styles['BodyTextCustom']
))

# Project 3
story.append(Paragraph(
    "<b>KKM Hotel Management Portal</b> <font color='#1d4ed8'>(MERN Stack)</font> - "
    "Full-stack web application to manage multiple hotels from a single portal, featuring real-time room availability tracking, "
    "online room booking with admin approval workflow, income and expense dashboard, maintenance management, "
    "Excel data export with database cleanup, secure JWT authentication, and REST APIs for efficient hotel operations.",
    styles['BodyTextCustom']
))

# Project 4
story.append(Paragraph(
    "<b>Sri Krishna Departmental Store</b> <font color='#1d4ed8'>(MERN Stack)</font> - "
    "Full-stack e-commerce web application for a retail departmental store, enabling users to search products, add to cart, "
    "place orders, and track order status in real time. Built an admin dashboard to upload products via manual entry and "
    "barcode scanning, manage products and offers, process orders through accept, dispatch, and delivered stages, "
    "track income, and manage users, with secure JWT authentication and REST APIs.",
    styles['BodyTextCustom']
))

# ==================== PAGE 2 ====================
story.append(PageBreak())

# Education
story.append(Paragraph("EDUCATION", styles['SectionTitle']))

edu1_table = Table([[
    Paragraph("<b>Master of Computer Applications (MCA)</b><br/><font color='#475569'>RVS College of Arts and Science, Coimbatore</font><br/><font color='#1d4ed8'><b>CGPA: 9.0</b></font>", styles['BodyTextCustom']),
    Paragraph("2024 – 2026", styles['JobDate'])
]], colWidths=[380, 160])
edu1_table.setStyle(TableStyle([('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
story.append(edu1_table)
story.append(Spacer(1, 4))

edu2_table = Table([[
    Paragraph("<b>Bachelor of Computer Applications (BCA)</b><br/><font color='#475569'>RVS College of Arts and Science, Coimbatore</font><br/><font color='#1d4ed8'><b>CGPA: 7.9 &nbsp;|&nbsp; Best Performer Award – Placement Training</b></font>", styles['BodyTextCustom']),
    Paragraph("2021 – 2024", styles['JobDate'])
]], colWidths=[380, 160])
edu2_table.setStyle(TableStyle([('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
story.append(edu2_table)
story.append(Spacer(1, 4))

edu3_table = Table([[
    Paragraph("<b>Higher Secondary School (HSC)</b><br/><font color='#475569'>Government Higher Secondary School, Peraiyur, Madurai</font><br/><font color='#1d4ed8'><b>Score: 90%</b></font>", styles['BodyTextCustom']),
    Paragraph("2019 – 2021", styles['JobDate'])
]], colWidths=[380, 160])
edu3_table.setStyle(TableStyle([('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
story.append(edu3_table)
story.append(Spacer(1, 10))

# Certifications & Achievements side-by-side
cert_items = [
    Paragraph("• <b>Java Programming Fundamentals</b> – Infosys Springboard (Sep 2023)", styles['BulletItem']),
    Paragraph("• <b>Front-End Development (HTML &amp; CSS)</b> – Great Learning (Jul 2023)", styles['BulletItem']),
    Paragraph("• <b>OOPs Concepts in Java</b> – Great Learning", styles['BulletItem']),
    Paragraph("• <b>PHP</b> – Great Learning", styles['BulletItem']),
    Paragraph("• <b>Basics of Python</b> – Infosys Springboard (Jul 2025)", styles['BulletItem']),
    Paragraph("• <b>EF SET Certificate</b> – English Proficiency (Jun 2025)", styles['BulletItem']),
    Paragraph("• <b>Cloud Computing with AWS</b> – Cloudplusai Technology", styles['BulletItem']),
]

ach_items = [
    Paragraph("• <b>Best Performer Award</b> – Placement Training, RVS College", styles['BulletItem']),
    Paragraph("• <b>2nd Place</b> – JPL Intra-College Competition (10member BCA team)", styles['BulletItem']),
    Paragraph("• <b>Coding Ninja Competition</b> – Java Coding (Certification)", styles['BulletItem']),
    Paragraph("• <b>Beecrowed Challenges</b> – Beginner Java Programming", styles['BulletItem']),
    Paragraph("• <b>Infosys Soft Skills Training</b> – Communication, Teamwork &amp; Workplace Readiness", styles['BulletItem']),
]

side_table_data = [
    [Paragraph("CERTIFICATIONS", styles['SectionTitle']), Paragraph("ACHIEVEMENTS &amp; ACTIVITIES", styles['SectionTitle'])],
    [cert_items, ach_items]
]

side_table = Table(side_table_data, colWidths=[265, 275])
side_table.setStyle(TableStyle([
    ('LEFTPADDING', (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ('TOPPADDING', (0,0), (-1,-1), 2),
    ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
]))
story.append(side_table)
story.append(Spacer(1, 12))

# Languages
story.append(Paragraph("LANGUAGES", styles['SectionTitle']))
story.append(Paragraph("Tamil (Native) &nbsp;|&nbsp; English (Proficient – EF SET Certified)", styles['BodyTextCustom']))

doc.build(story)
print(f"Successfully created high-quality PDF at: {pdf_path}")

