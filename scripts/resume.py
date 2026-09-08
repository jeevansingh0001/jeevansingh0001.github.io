"""Generate the public resume from the portfolio's editable content files."""
from pathlib import Path
import json
from html import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1]
p = json.loads((ROOT / 'content/profile.json').read_text(encoding='utf-8'))
projects = json.loads((ROOT / 'content/projects.json').read_text(encoding='utf-8'))
target = ROOT / 'public/assets/Jagjeevan_Singh_Soni_Resume.pdf'
target.parent.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
for name, kwargs in {
    'Name': dict(fontName='Helvetica-Bold', fontSize=23, leading=27, textColor=HexColor('#111e2d'), spaceAfter=6),
    'Section': dict(fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=HexColor('#111e2d'), spaceBefore=14, spaceAfter=7, keepWithNext=True),
    'Entry': dict(fontName='Helvetica-Bold', fontSize=10.4, leading=14, spaceBefore=5, spaceAfter=3, keepWithNext=True),
    'Copy': dict(fontName='Helvetica', fontSize=9.7, leading=13.7, textColor=HexColor('#354250'), spaceAfter=6),
    'Meta': dict(fontName='Helvetica', fontSize=8.8, leading=12.5, textColor=HexColor('#53606d'), spaceAfter=5),
}.items():
    styles.add(ParagraphStyle(name, **kwargs))
def clean(text):
    for a,b in [('–','-'),('—','-'),('’',"'"),('·',' | '),('→','to')]: text=text.replace(a,b)
    return escape(text)
def para(text, style='Copy'):
    return Paragraph(clean(text), styles[style])
story=[]
story += [para(p['name'].upper(),'Name'),para(f"{p['role']} | {p['location']}",'Meta')]
story.append(Paragraph(f'<link href="mailto:{p["email"]}">{p["email"]}</link> | <link href="{p["linkedin"]}">LinkedIn</link> | <link href="{p["github"]}">GitHub</link> | <link href="{p["url"]}">Portfolio</link>',styles['Meta']))
story += [Spacer(1,7), para(p['about']), para('EXPERIENCE','Section'),para('Amdocs | Software Developer','Entry'),para(p['experience']['period']+' | Previously Associate Software Engineer','Meta')]
for a in p['experience']['areas']:
    story.append(Paragraph(f'<b>{clean(a["title"])}</b><br/>{clean(a["text"])}',styles['Copy']))
ed=p['education']
story += [para('EDUCATION','Section'), para(ed['degree'],'Entry'),para(ed['school'],'Copy'),para(ed['period']+' | '+ed['grade'],'Meta'),para(ed['focus'],'Copy'),para('Relevant coursework: '+', '.join(ed['courses'][:7])+'.','Copy')]
story += [para('RECOGNITION & LEADERSHIP','Section')]
for a in p['recognition'][:2]:
    story.append(Paragraph(f'<b>{clean(a["title"])}</b> | {clean(a["org"])}<br/>{clean(a["text"])}',styles['Copy']))
story += [para('Event Management Head, VIRSA; Public Relations Head, OWASP Student Chapter. Supported cultural events, technical programming, sponsorship outreach, and student teams.'), PageBreak(),para('PROJECTS & TECHNICAL SKILLS','Section')]
for project in projects:
    lines=[para(project['name']+' | '+project['category'],'Entry'),para(' | '.join(project['tech']),'Meta'),para(project['summary']),para(project['role'])]
    if project.get('metric'):
        lines.append(para('Extra Trees achieved 95.45% offline evaluation accuracy; this does not establish performance on unseen participants or live game control.'))
    elif project['slug']=='drivesafe':
        lines.append(para('Used 68 facial landmarks, timed visual and audible alerts, and a separate Tinkercad control simulation with four ultrasonic sensors.'))
    elif project['slug']=='shabad-shazam':
        lines.append(para('Spectral analysis, peak-pair hashing, and time-aligned PostgreSQL matching. Prototype limited to indexed recordings.'))
    elif project['slug']=='med-e-care':
        lines.append(para('Customer accounts, medicine ordering, inventory updates, sales tracking, and NGO ordering with expiry-based availability.'))
    story += [KeepTogether(lines),Spacer(1,4)]
story += [para('TECHNICAL SKILLS','Section')]
for group in p['skills']:
    story.append(Paragraph(f'<b>{clean(group["group"])}:</b> {clean(", ".join(group["items"]))}', styles['Copy']))
story += [para('Languages: English, Punjabi, Hindi.','Meta')]
def footer(canvas,doc):
    canvas.setFillColor(HexColor('#63717f'))
    canvas.setFont('Helvetica',8)
    canvas.drawString(43,26,'Jagjeevan Singh Soni | jeevansingh0001.github.io')
    canvas.drawRightString(A4[0]-43,26,str(doc.page))
doc=SimpleDocTemplate(str(target),pagesize=A4,rightMargin=43,leftMargin=43,topMargin=36,bottomMargin=43,title='Jagjeevan Singh Soni - Resume',author=p['name'])
doc.build(story,onFirstPage=footer,onLaterPages=footer)
reader=PdfReader(target)
writer=PdfWriter()
writer.append_pages_from_reader(reader)
writer.add_metadata({'/Title':'Jagjeevan Singh Soni - Resume','/Author':p['name'],'/Subject':'Professional experience, education, and projects','/Creator':p['name'],'/Producer':''})
with target.open('wb') as f: writer.write(f)
print(f'Created {target.name}: {len(reader.pages)} pages')
