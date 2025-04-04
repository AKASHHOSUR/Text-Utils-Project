// Home.js
import React, { useState} from "react";
// import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

function Home(props) {
  const [text, setText] = useState("");
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);

  // List of themes for dynamic theming
  const themes = ["#d8e4d0", "#f0e68c", "#e6e6fa", "#ffefd5"];
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

  // Set initial background color on mount
  // useEffect(() => {
  //   document.body.style.backgroundColor = themes[currentThemeIndex];
  // }, []);


  // Push current text to history and clear redo history on a new change
  const pushHistory = (currentText) => {
    setHistory((prev) => [...prev, currentText]);
    setRedoHistory([]); // clear redo history
  };

  const handleOnChange = (e) => {
    setText(e.target.value);
    // Reset the height to allow shrinkage when deleting text
    e.target.style.height = "auto";
    const maxHeight = 300; // Maximum height in pixels (should match CSS max-height)
    if (e.target.scrollHeight <= maxHeight) {
      // If content is within the max height, expand the textarea
      e.target.style.height = `${e.target.scrollHeight}px`;
      e.target.style.overflowY = "hidden";
    } else {
      // If content exceeds max height, set height to max and allow scrolling
      e.target.style.height = `${maxHeight}px`;
      e.target.style.overflowY = "scroll";
    }
  };

  // Text transformation functions
  const handleUpClick = () => {
    pushHistory(text);
    let newText = text.toUpperCase();
    setText(newText);
    props.showAlert("Converted to uppercase!", "success");
  };

  const handleLoClick = () => {
    pushHistory(text);
    let newText = text.toLowerCase();
    setText(newText);
    props.showAlert("Converted to lowercase!", "success");
  };

  const handleTitleCase = () => {
    pushHistory(text);
    let newText = text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    setText(newText);
    props.showAlert("Converted to TitleCase!", "success");
  };

  const handleSentenceCase = () => {
    pushHistory(text);
    let lowerText = text.toLowerCase();
    let sentences = lowerText.split(/([.?!]\s*)/);
    let newText = sentences
      .map((sentence, index) => {
        if (index % 2 === 0 && sentence.length > 0) {
          return sentence.charAt(0).toUpperCase() + sentence.slice(1);
        }
        return sentence;
      })
      .join("");
    setText(newText);
    props.showAlert("Converted to SentenceCase!", "success");
  };

  const handleClearClick = () => {
    pushHistory(text);
    setText("");
    props.showAlert("Text cleared!", "success");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    props.showAlert("Copied to clipboard!", "success");
  };

  const handleExtraSpaces = () => {
    pushHistory(text);
    let newText = text.split(/[ ]+/).join(" ");
    setText(newText);
    props.showAlert("Extra spaces removed!", "success");
  };

  // Undo and Redo functions
  const handleUndo = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setRedoHistory((prev) => [...prev, text]);
      setText(lastState);
      setHistory((prev) => prev.slice(0, -1));
      props.showAlert("Undid last action", "success");
    } else {
      props.showAlert("No more actions to undo", "warning");
    }
  };

  const handleRedo = () => {
    if (redoHistory.length > 0) {
      const lastRedo = redoHistory[redoHistory.length - 1];
      pushHistory(text);
      setText(lastRedo);
      setRedoHistory((prev) => prev.slice(0, -1));
      props.showAlert("Redid last undone action", "success");
    } else {
      props.showAlert("No actions to redo", "warning");
    }
  };

  // Text-to-Speech using the Web Speech API
  const handleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      // Check if voices are loaded
      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // If voices haven't loaded, wait for them to be available
        window.speechSynthesis.onvoiceschanged = () => {
          speakText();
        };
      } else {
        speakText();
      }
    } else {
      props.showAlert("Text-to-Speech not supported", "warning");
    }
  };
  
  const speakText = () => {
    let utterance = new SpeechSynthesisUtterance(text);
    // Optionally, set a specific voice (e.g., one that matches your language)
    const voices = window.speechSynthesis.getVoices();
    // Example: pick an English voice if available
    const selectedVoice = voices.find(voice => voice.lang.includes('en')) || voices[0];
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Optional: add event listeners for debugging
    utterance.onstart = () => console.log("Speech started");
    utterance.onerror = (e) => console.error("Speech error:", e);
  
    window.speechSynthesis.speak(utterance);
    props.showAlert("Speaking text", "success");
  };

  // Speech-to-Text using the Web Speech API
  const handleSpeechToText = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      let recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.start();
      recognition.onresult = function (event) {
        let spokenText = event.results[0][0].transcript;
        pushHistory(text);
        setText(text + " " + spokenText);
        props.showAlert("Speech recognized", "success");
      };
      recognition.onerror = function () {
        props.showAlert("Error in speech recognition", "danger");
      };
    } else {
      props.showAlert("Speech-to-Text not supported", "warning");
    }
  };

  // Export functions
  const handleExportTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "text.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    props.showAlert("Exported as .txt", "success");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(text, 10, 10);
    doc.save("text.pdf");
    props.showAlert("Exported as PDF", "success");
  };

  // Dynamic theming: cycle through a list of background colors
  const handleCycleTheme = () => {
    const nextIndex = (currentThemeIndex + 1) % themes.length;
    setCurrentThemeIndex(nextIndex);
    document.body.style.backgroundColor = themes[nextIndex];
    props.showAlert("Theme changed", "success");
  };

  // New: Stop Text-to-Speech Function
  const handleStopSpeech = (text) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      props.showAlert("Stopped Text-to-Speech!", "success");
    } else {
      props.showAlert("No Speech to Stop!", "warning");
    }
  };

  // Enhanced Text Analytics
  const wordCount = text.split(/\s+/).filter((word) => word.length !== 0).length;
  const charCount = text.length;
  const sentenceCount = text.split(/[.?!]/).filter((sentence) => sentence.trim().length > 0).length;
  const paragraphCount = text.split(/\n+/).filter((paragraph) => paragraph.trim().length > 0).length;
  const readingTime = (wordCount / 200).toFixed(2); // average reading speed 200 wpm

  return (
    <div>
      <div className="mb-3">
        <textarea
          className="interactive-textarea mx-2"
          id="textBox"
          rows="10"
          value={text}
          onChange={handleOnChange}
        ></textarea>
      </div>

      <div className="buttons">
        <button className="btn btn-info my-1 mx-1" onClick={handleUpClick}>
          Uppercase
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleLoClick}>
          Lowercase
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleTitleCase}>
          Title Case
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleSentenceCase}>
          Sentence Case
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleClearClick}>
          Clear
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleCopy}>
          Copy
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleExtraSpaces}>
          Remove Extra Spaces
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleUndo}>
          Undo
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleRedo}>
          Redo
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleTextToSpeech}>
          Text-to-Speech
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleStopSpeech}>
          Stop Speech
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleSpeechToText}>
          Speech-to-Text
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleExportTxt}>
          Export as TXT
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleExportPDF}>
          Export as PDF
        </button>
        <button className="btn btn-info my-1 mx-1" onClick={handleCycleTheme}>
          Cycle Theme
        </button>
      </div>

      {/* Enhanced Text Analytics */}
      <div className={`container text-${props.mode === 'light' ? 'dark' : 'white'} my-3`}>
        <h2>Your text summary</h2>
        <p>{wordCount} words, {charCount} characters</p>
        <p>{sentenceCount} sentences, {paragraphCount} paragraphs</p>
        <p>Estimated Reading Time: {readingTime} minutes</p>
      </div>

      {/* Live Preview with Rich Formatting (Markdown Supported) */}
      <div className={`container my-3 text-${props.mode === 'light' ? 'dark' : 'white'}`}>
        <h2>Live Preview </h2>
        {/* <ReactMarkdown>{text}</ReactMarkdown> */}
        <p>{text}</p>
      </div>
    </div>
  );
}

export default Home;