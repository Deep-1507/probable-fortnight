---

# Template Editor

A simple **web-based template editor** built in React that allows loading, editing, and saving JSON-based design templates.

This project was built as part of the **Software Intern Assignment**.

---

## ✨ Features

✅ **Load JSON templates** (upload `.json` files)
✅ **Render templates on Canvas** (text + rectangles)
✅ **Select and edit elements** in an inspector panel (text, colors, font size, width, height, position)
✅ **Drag & drop elements** directly on the canvas
✅ **Undo / Redo** support for all changes
✅ **Add / Delete elements** (text or rectangles)
✅ **Save JSON** back as a file (download)
✅ **Switch between multiple templates** (dropdown)
✅ **Export to MP4 (dummy)** → confirmation alert only (stretch goal)

---

## 📦 JSON Schema Example

```json
{
  "template_id": "001",
  "category": "Hiring",
  "elements": [
    {
      "type": "text",
      "value": "We are Hiring!",
      "x": 50,
      "y": 50,
      "color": "#0A66C2",
      "fontSize": 24
    },
    {
      "type": "text",
      "value": "Join our team at Pulzr.ai",
      "x": 50,
      "y": 100,
      "color": "#333333",
      "fontSize": 18
    },
    {
      "type": "rectangle",
      "x": 40,
      "y": 40,
      "width": 300,
      "height": 100,
      "color": "#E5E5E5"
    }
  ]
}
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Deep-1507/probable-fortnight
cd probable-fortnight
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm start
```

The app will be available at **[http://localhost:5173/](http://localhost:5173/)**

---

## 🛠 Tech Stack

* **React** (functional components, hooks)
* **HTML Canvas API** (rendering shapes + text)
* **JavaScript ES6+**
* **Tailwind CSS** (for styling)

---

## 📂 Project Structure

```
src/
│── App.jsx         # Main React component (Template Editor)
│── index.css       # Tailwind CSS imports
│── main.jsx        # React entry point (Vite) / index.js (CRA)
public/
│── index.html      # Base HTML template
```

---

## 📖 How to Use

1. **Load JSON** → Upload a JSON file with template schema.
2. **Edit elements** → Select an element from the side panel and update its properties.
3. **Drag elements** → Move text/rectangles directly on the canvas.
4. **Undo / Redo** → Navigate through history of changes.
5. **Save JSON** → Download the updated template as `.json`.
6. **Switch templates** → Use dropdown to switch between built-in examples.
7. **Export MP4 (dummy)** → Shows a confirmation message (stretch goal).

---

## 📌 Future Improvements

* Real **video export (MP4)** using frame rendering + encoding.
* Support for **images** in templates.
* Multi-select and group transformations.
* Improved text handling (wrapping, alignment, fonts).
* Snap-to-grid and guides.

---

## 🧑‍💻 Author

**Deependra Kumar**

* 📧 [deependrakumar15072003@gmail.com](mailto:deependrakumar15072003@gmail.com)
* 🌐 [LinkedIn](https://www.linkedin.com/in/deep-fl1507/) | [GitHub](https://github.com/Deep-1507/)

---