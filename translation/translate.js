const db = new Dexie('conlangDB');
db.version(1).stores({
  dictionary: 'word,meaning'
});

db.on('populate', async () => {
  await db.dictionary.bulkAdd([
    { word: 'nee', meaning: 'I' },
    { word: 'foo', meaning: 'love' },
    { word: 'ree', meaning: 'you' },
    { word: 'roo', meaning: 'show' }
  ]);
});

async function ensureData() {
  const count = await db.dictionary.count();
  if (count === 0) await db.populate();
}

ensureData();

async function searchDictionary(query) {
  if (!query) return [];
  query = query.toLowerCase();

  return await db.dictionary
    .filter(entry =>
      entry.word.toLowerCase().includes(query) ||
      entry.meaning.toLowerCase().includes(query)
    )
    .toArray();
}

// Add a function to find exact word match
async function findExactWordMatch(word) {
  const normalizedWord = word.toLowerCase();
  const entries = await db.dictionary
    .filter(entry =>
      entry.word.toLowerCase() === normalizedWord ||
      entry.meaning.toLowerCase() === normalizedWord
    )
    .toArray();
  return entries.length > 0 ? entries[0] : null;
}


const searchBox = document.getElementById('searchInput');
const results = document.getElementById('searchResults');
const wordInput = document.getElementById('wordInput');
const meaningInput = document.getElementById('meaningInput');
const addWordBtn = document.getElementById('addWordBtn');
const updateWordBtn = document.getElementById('updateWordBtn');
const deleteWordBtn = document.getElementById('deleteWordBtn');
const editSection = document.getElementById('editSection');

const translateInput = document.getElementById('translateInput');
const translateOutput = document.getElementById('translateOutput');
const directionBtn = document.getElementById('directionBtn');

let translateToConlang = true; // true = English → Conlang, false = Conlang → English

// Update button text based on direction
function updateDirectionButton() {
  directionBtn.textContent = translateToConlang ? 'English → Conlang' : 'Conlang → English';
}

// Initialize button text
updateDirectionButton();

// Toggle translation direction
directionBtn.addEventListener('click', () => {
  translateToConlang = !translateToConlang;
  updateDirectionButton();
  
  // Retranslate if there's text in the input
  if (translateInput.value.trim()) {
    translateInput.dispatchEvent(new Event('input'));
  }
});

let selectedEntry = null; // Store the currently selected entry

searchBox.addEventListener('input', async e => {
  const query = e.target.value.trim();
  const matches = await searchDictionary(query);

  results.innerHTML = '';
  matches.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.word} - ${entry.meaning}`;
    li.dataset.word = entry.word; // Store the word for reference
    li.dataset.meaning = entry.meaning; // Store the meaning for reference
    
    // Add click handler to select this item
    li.addEventListener('click', () => {
      // Remove selected class from all items
      results.querySelectorAll('li').forEach(item => {
        item.classList.remove('selected');
      });
      
      // Add selected class to clicked item
      li.classList.add('selected');
      
      // Store the selected entry
      selectedEntry = {
        word: entry.word,
        meaning: entry.meaning
      };
      
      // Populate the input fields
      wordInput.value = entry.word;
      meaningInput.value = entry.meaning;
      
      // Show the edit section
      editSection.style.display = 'block';
    });
    
    results.appendChild(li);
  });
  
  // Clear selection if search changes
  selectedEntry = null;
  wordInput.value = '';
  meaningInput.value = '';
  
  // Hide the edit section when search changes
  editSection.style.display = 'none';
});

// Add Word button handler
addWordBtn.addEventListener('click', async () => {
  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();
  
  if (!word || !meaning) {
    alert('Please enter both word and meaning');
    return;
  }
  
  try {
    // Check if word already exists
    const existing = await db.dictionary.get(word);
    if (existing) {
      alert('This word already exists. Use Update instead.');
      return;
    }
    
    await db.dictionary.add({ word, meaning });
    alert('Word added successfully!');
    
    // Clear inputs and refresh search
    wordInput.value = '';
    meaningInput.value = '';
    selectedEntry = null;
    
    // Hide the edit section
    editSection.style.display = 'none';
    
    // Refresh search results if there's a search query
    if (searchBox.value.trim()) {
      searchBox.dispatchEvent(new Event('input'));
    }
  } catch (error) {
    alert('Error adding word: ' + error.message);
  }
});

// Update Word button handler
updateWordBtn.addEventListener('click', async () => {
  if (!selectedEntry) {
    alert('Please select a word from the search results to update');
    return;
  }
  
  const newWord = wordInput.value.trim();
  const newMeaning = meaningInput.value.trim();
  
  if (!newWord || !newMeaning) {
    alert('Please enter both word and meaning');
    return;
  }
  
  try {
    const oldWord = selectedEntry.word;
    
    // If word changed, need to delete old and add new
    if (oldWord !== newWord) {
      await db.dictionary.delete(oldWord);
      await db.dictionary.add({ word: newWord, meaning: newMeaning });
    } else {
      // Just update the meaning
      await db.dictionary.update(oldWord, { meaning: newMeaning });
    }
    
    // Clear inputs and refresh search
    wordInput.value = '';
    meaningInput.value = '';
    selectedEntry = null;
    
    // Hide the edit section
    editSection.style.display = 'none';
    
    // Remove selected class from all items
    results.querySelectorAll('li').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Refresh search results if there's a search query
    if (searchBox.value.trim()) {
      searchBox.dispatchEvent(new Event('input'));
    }
  } catch (error) {
    alert('Error updating word: ' + error.message);
  }
});

// Delete Word button handler
deleteWordBtn.addEventListener('click', async () => {
  if (!selectedEntry) {
    alert('Please select a word from the search results to delete');
    return;
  }
  
  if (!confirm(`Are you sure you want to delete "${selectedEntry.word}"?`)) {
    return;
  }
  
  try {
    await db.dictionary.delete(selectedEntry.word);
    alert('Word deleted successfully!');
    
    // Clear inputs and refresh search
    wordInput.value = '';
    meaningInput.value = '';
    selectedEntry = null;
    
    // Hide the edit section
    editSection.style.display = 'none';
    
    // Remove selected class from all items
    results.querySelectorAll('li').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Refresh search results if there's a search query
    if (searchBox.value.trim()) {
      searchBox.dispatchEvent(new Event('input'));
    }
  } catch (error) {
    alert('Error deleting word: ' + error.message);
  }
});

async function translatePhrase(phrase, toConlang) {
  if (!phrase) return '';
  
  const words = phrase.split(/(\s+)/); // Preserve whitespace
  const translatedWords = [];

  for (const word of words) {
    // Preserve whitespace as-is
    if (/^\s+$/.test(word)) {
      translatedWords.push(word);
      continue;
    }
    
    // Clean the word (remove punctuation for lookup, but preserve it)
    const cleanedWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
    if (!cleanedWord) {
      translatedWords.push(word);
      continue;
    }
    
    const entry = await findExactWordMatch(cleanedWord);
    if (entry) {
      // Translate based on direction
      let translation;
      if (toConlang) {
        // English → Conlang: if input matches meaning, use word
        if (entry.meaning.toLowerCase() === cleanedWord) {
          translation = entry.word;
        } else if (entry.word.toLowerCase() === cleanedWord) {
          // If it already matches conlang word, keep it
          translation = entry.word;
        } else {
          // Not found as either, keep original
          translation = word;
        }
      } else {
        // Conlang → English: if input matches word, use meaning
        if (entry.word.toLowerCase() === cleanedWord) {
          translation = entry.meaning;
        } else if (entry.meaning.toLowerCase() === cleanedWord) {
          // If it already matches meaning, keep it
          translation = entry.meaning;
        } else {
          // Not found as either, keep original
          translation = word;
        }
      }
      
      // Preserve original capitalization and punctuation
      const punctuation = word.match(/[.,!?;:]/g);
      const punctStr = punctuation ? punctuation.join('') : '';
      
      // Only add punctuation if we found a translation
      if (translation !== word) {
        translatedWords.push(translation + punctStr);
      } else {
        translatedWords.push(word);
      }
    } else {
      // Word not found, keep original
      translatedWords.push(word);
    }
  }

  return translatedWords.join('');
}

translateInput.addEventListener('input', async e => {
  const sourceText = e.target.value;
  if (!sourceText.trim()) {
    translateOutput.textContent = 'Translation will appear here...';
    return;
  }
  const translation = await translatePhrase(sourceText, translateToConlang);
  translateOutput.textContent = translation;
});

// Import/Export functionality
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
const importExportStatus = document.getElementById('importExportStatus');

// Export database to JSON
exportBtn.addEventListener('click', async () => {
  try {
    const allEntries = await db.dictionary.toArray();
    const jsonData = JSON.stringify(allEntries, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conlang-dictionary-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    importExportStatus.textContent = `✓ Exported ${allEntries.length} entries successfully!`;
    importExportStatus.style.color = 'var(--success-color)';
    
    // Clear status after 3 seconds
    setTimeout(() => {
      importExportStatus.textContent = '';
    }, 3000);
  } catch (error) {
    importExportStatus.textContent = `✗ Export failed: ${error.message}`;
    importExportStatus.style.color = 'var(--danger-color)';
  }
});

// Import database from JSON
importBtn.addEventListener('click', () => {
  importFileInput.click();
});

importFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const fileText = await file.text();
    const entries = JSON.parse(fileText);
    
    // Validate the structure
    if (!Array.isArray(entries)) {
      throw new Error('Invalid file format. Expected an array of entries.');
    }
    
    // Validate each entry has word and meaning
    for (const entry of entries) {
      if (!entry.word || !entry.meaning) {
        throw new Error('Invalid entry format. Each entry must have "word" and "meaning" properties.');
      }
    }
    
    // Clear existing data or merge? For now, we'll replace everything
    // You could change this to merge by using bulkPut instead of clearing first
    const confirmReplace = confirm(
      `This will import ${entries.length} entries. ` +
      `Existing entries with the same word will be updated. Continue?`
    );
    
    if (!confirmReplace) {
      importFileInput.value = '';
      return;
    }
    
    // Use bulkPut to add or update entries
    await db.dictionary.bulkPut(entries);
    
    importExportStatus.textContent = `✓ Imported ${entries.length} entries successfully!`;
    importExportStatus.style.color = 'var(--success-color)';
    
    // Refresh search results if there's a search query
    if (searchBox.value.trim()) {
      searchBox.dispatchEvent(new Event('input'));
    }
    
    // Clear the file input
    importFileInput.value = '';
    
    // Clear status after 3 seconds
    setTimeout(() => {
      importExportStatus.textContent = '';
    }, 3000);
  } catch (error) {
    importExportStatus.textContent = `✗ Import failed: ${error.message}`;
    importExportStatus.style.color = 'var(--danger-color)';
    importFileInput.value = '';
  }
});