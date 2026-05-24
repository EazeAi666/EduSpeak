import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Trash2, Edit3, Save, X, StickyNote, Mic, Volume2, FileDown } from 'lucide-react';
import { saveNote, updateNote, deleteNote, subscribeToNotes, Note } from '../services/noteService';
import { getPreferredAccent } from '../services/settingsService';
import { jsPDF } from 'jspdf';

export default function Notes() {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentNote, setCurrentNote] = React.useState<Partial<Note> | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);

  React.useEffect(() => {
    return subscribeToNotes((fetchedNotes) => {
      setNotes(fetchedNotes);
    });
  }, []);

  const exportNoteToPDF = (note: Partial<Note>) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // A4 usually 210
      const pageHeight = doc.internal.pageSize.getHeight(); // A4 usually 297
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2); // 170

      const primaryColor = [90, 90, 64]; // #5A5A40 (Sage Green / Dark Olive)
      const secondaryColor = [26, 26, 26]; // #1A1A1A (Charcoal)
      const mutedColor = [110, 110, 110]; // Muted Grey for small labels
      const lightLineColor = [225, 220, 215]; // Fine light grey border

      let pageNum = 1;

      // Header and Footer drawer helper
      const drawHeaderAndFooter = () => {
        // Decorative top bar in sage green
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(margin, 12, contentWidth, 1.5, 'F');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('EDUSPEAK STUDY SYSTEM', margin, 18);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
        doc.text('National Certificate in Education (NCE) Companion', pageWidth - margin, 18, { align: 'right' });

        // Fine divider line below header
        doc.setDrawColor(lightLineColor[0], lightLineColor[1], lightLineColor[2]);
        doc.setLineWidth(0.25);
        doc.line(margin, 20.5, pageWidth - margin, 20.5);

        // Elegant bottom line and footer
        doc.setDrawColor(lightLineColor[0], lightLineColor[1], lightLineColor[2]);
        doc.setLineWidth(0.25);
        doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

        doc.setFontSize(7.5);
        doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
        doc.text('Classroom Study Material • Public Educational Resource', margin, pageHeight - 9);
        doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
      };

      // Draw standard header and footer on initial page
      drawHeaderAndFooter();

      let y = 30;

      // Note Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      
      const titleLines = doc.splitTextToSize(note.title || 'Untitled Study Note', contentWidth);
      titleLines.forEach((line: string) => {
        if (y > pageHeight - 30) {
          doc.addPage();
          pageNum++;
          drawHeaderAndFooter();
          y = 30;
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(20);
          doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        }
        doc.text(line, margin, y);
        y += 8.5;
      });

      y += 1.5; // subtle divider spacing

      // Metadata card
      let creationDateStr = '';
      if (note.timestamp) {
        if (typeof note.timestamp.toDate === 'function') {
          creationDateStr = note.timestamp.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } else if (note.timestamp instanceof Date) {
          creationDateStr = note.timestamp.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } else {
          creationDateStr = new Date(note.timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
      } else {
        creationDateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      }

      const tagsList = note.tags && note.tags.length > 0 ? note.tags.join(', ').toUpperCase() : 'GENERAL STUDY';

      // Meta box backdrop
      doc.setFillColor(245, 242, 237); // Warm paper tint
      doc.rect(margin, y, contentWidth, 11, 'F');
      
      // Accent vertical line inside meta box
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, y, 1.2, 11, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`NCE SYLLABUS DOMAIN: ${tagsList}`, margin + 4, y + 4.5);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`RECORDED ON: ${creationDateStr.toUpperCase()}`, margin + 4, y + 8);

      y += 18; // safe gap before content body

      // Heading block for study notes
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('CORE LESSON NOTES & SUMMARY', margin, y);
      y += 4.5;

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, y, 32, 0.4, 'F'); // sleek little summary line anchor
      y += 7.5;

      // Note content body printing with line-by-line wrapping logic
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      const rawContent = note.content || 'No notes contents provided.';
      const paragraphs = rawContent.split('\n');
      const lineHeight = 5.8;

      paragraphs.forEach((pText) => {
        const cleanParagraph = pText.trim();
        if (!cleanParagraph) {
          y += 3.5; // empty space paragraph
          return;
        }

        const lines = doc.splitTextToSize(cleanParagraph, contentWidth);
        lines.forEach((line: string) => {
          if (y > pageHeight - 20) {
            doc.addPage();
            pageNum++;
            drawHeaderAndFooter();
            y = 28;
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });
        y += 2.5; // margin gap between paragraphs
      });

      // Filename mapping
      const cleanFileName = (note.title || 'untitled-note')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'study-note';

      doc.save(`eduspeak-study-note-${cleanFileName}.pdf`);
    } catch (err) {
      console.error('Error generating study note PDF:', err);
      alert('We were unable to print your PDF. Please ensure all details are correct.');
    }
  };

  const handleCreateNew = () => {
    setCurrentNote({ title: '', content: '', tags: [] });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentNote?.title || !currentNote?.content) return;

    if (currentNote.id) {
      await updateNote(currentNote.id, currentNote.title, currentNote.content, currentNote.tags);
    } else {
      await saveNote(currentNote.title, currentNote.content, currentNote.tags);
    }
    setIsEditing(false);
    setCurrentNote(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(id);
    }
  };

  const handleEdit = (note: Note) => {
    setCurrentNote(note);
    setIsEditing(true);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startVoiceToText = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (currentNote) {
        setCurrentNote(prev => ({
          ...prev,
          content: (prev?.content || '') + ' ' + transcript
        }));
      }
    };

    recognition.start();
  };

  const speakNote = (content: string) => {
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = getPreferredAccent();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif text-[#1A1A1A]">My Study Notes</h1>
          <p className="text-[#1A1A1A]/40">Organize your thoughts and NCE study insights.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-[#5A5A40] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-[#5A5A40]/20 active:scale-95"
        >
          <Plus size={20} /> New Study Note
        </button>
      </header>

      <div className="relative group">
        <input 
          type="text" 
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#1A1A1A]/5 rounded-2xl py-4 px-12 focus:ring-2 focus:ring-[#5A5A40]/20 outline-none transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A1A]/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <motion.div
            layout
            key={note.id}
            onClick={() => handleEdit(note)}
            className="group bg-white p-6 rounded-[2.5rem] border border-[#1A1A1A]/5 shadow-sm hover:shadow-xl hover:border-[#5A5A40]/20 transition-all cursor-pointer relative"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#F5F2ED] rounded-2xl flex items-center justify-center text-[#5A5A40] group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
                <StickyNote size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-[#1A1A1A] line-clamp-1">{note.title}</h3>
                <p className="text-[#1A1A1A]/60 text-sm line-clamp-3 leading-relaxed">{note.content}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]/5">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#1A1A1A]/30">
                  {note.timestamp?.toDate().toLocaleDateString() || 'Just now'}
                </span>
                <div className="flex items-center gap-1">
                   <button 
                    onClick={(e) => { e.stopPropagation(); speakNote(note.content); }}
                    className="p-2 text-[#1A1A1A]/30 hover:text-[#5A5A40] hover:bg-[#F5F2ED] rounded-xl transition-all"
                    title="Read aloud"
                  >
                    <Volume2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); exportNoteToPDF(note); }}
                    className="p-2 text-[#1A1A1A]/30 hover:text-[#5A5A40] hover:bg-[#F5F2ED] rounded-xl transition-all"
                    title="Export as PDF"
                  >
                    <FileDown size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(note.id!, e)}
                    className="p-2 text-[#1A1A1A]/30 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 space-y-8 overflow-hidden relative"
            >
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 bg-[#5A5A40]/10 rounded-2xl flex items-center justify-center text-[#5A5A40]">
                  <Edit3 size={24} />
                </div>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-[#F5F2ED] rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <input 
                  type="text" 
                  placeholder="Note Title"
                  value={currentNote?.title}
                  onChange={(e) => setCurrentNote(prev => ({ ...prev!, title: e.target.value }))}
                  className="w-full text-3xl font-serif font-bold border-none outline-none focus:ring-0 placeholder:text-[#1A1A1A]/10"
                />

                <div className="relative capitalize">
                  <textarea 
                    placeholder="Start writing your thoughts here..."
                    value={currentNote?.content}
                    onChange={(e) => setCurrentNote(prev => ({ ...prev!, content: e.target.value }))}
                    className="w-full min-h-[300px] text-lg border-none outline-none focus:ring-0 placeholder:text-[#1A1A1A]/10 resize-none leading-relaxed"
                  />
                  
                  <div className="absolute right-0 bottom-0 p-4">
                    <button 
                      onClick={startVoiceToText}
                      className={`p-4 rounded-full transition-all shadow-lg ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#5A5A40] text-white hover:bg-[#5A5A40]/90'}`}
                    >
                      <Mic size={24} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    if (currentNote?.title && currentNote?.content) {
                      exportNoteToPDF(currentNote);
                    } else {
                      alert('Please provide a title and notes content first.');
                    }
                  }}
                  className="px-6 bg-[#F5F2ED] hover:bg-[#5A5A40]/10 text-[#5A5A40] py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Download and print note as classroom physical layout PDF"
                >
                  <FileDown size={20} /> Export PDF
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-[#5A5A40] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-xl shadow-[#5A5A40]/20"
                >
                  <Save size={20} /> Save Study Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
