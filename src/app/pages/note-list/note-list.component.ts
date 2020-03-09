import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Note } from 'src/app/shared/note.model';
import { NotesService } from 'src/app/shared/notes.service';
import { trigger, transition, animate, style, query, stagger } from '@angular/animations';
import { not } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss'],
  animations: [
    trigger('itemAnim', [
      // Entry Animation
      transition('void => *', [
        // Set initiale state
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.85)',
          'margin-bottom': 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
        }),
        animate('50ms', style({
          height: '*',
          'margin-bottom': '*',
          paddingTop: '*',
          paddingBottom: '*',
          paddingRight: '*',
          paddingLeft: '*'
        })),
        animate(68)
      ]),

      transition('* => void', [
        // first scale up
        animate(50, style({
          transform: 'scale(1.05)'
        })),
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.75
        })),
        animate('120ms ease-out', style({
          transform: 'scale(0.68)',
          opacity: 0
        })),
        animate('150ms ease-out', style({
          height: 0,
          'margin-bottom': 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
        }))
      ])
    ]),
    trigger('listAnim', [
      transition('* => *', [
        query(':enter', [
          style({
            opacity: 0,
            height: 0
          }),
          stagger(100, [
            animate('0.2s ease')
          ])
        ], {
          optional: true
        })
      ])
    ])
  ]
})
export class NoteListComponent implements OnInit {

  notes: Note[] = new Array<Note>();
  filteredNotes: Note[] = new Array<Note>();
  
  @ViewChild('filterInput') filterInputElementRef: ElementRef<HTMLInputElement>

  constructor(private notesService: NotesService) { }

  ngOnInit() {
    // Retrive all notes from note service
    this.notes = this.notesService.getAll();
    // this.filteredNotes = this.notesService.getAll();
    this.filter('');
  }

  deleteNote(note: Note) {
    let noteId = this.notesService.getId(note);
    this.notesService.delete(noteId);
    this.filter(this.filterInputElementRef.nativeElement.value);

  }

  generateNoteUrl(note: Note) {
    let noteId = this.notesService.getId(note);
    return noteId;
  }

  filter(query: string) {
    query = query.toLowerCase().trim();
    let allResults: Note[] = new Array<Note>();

    let terms: string[] = query.split(' ');
    // remove duplicate search terms
    terms = this.removeDuplicate(terms);
    // Compile all relvent result into allResults array
    terms.forEach(term => {
      let results: Note[] = this.releventNotes(term);
      // Append results to the allREsults array
      allResults = [...allResults, ...results];
    });

    // AllResults will include duplicate notes
    // Becuase a praticular note be the result many term
    let uniqeResults = this.removeDuplicate(allResults);
    this.filteredNotes = uniqeResults

    // Sort by Relevncy
    this.sortByRelevancy(allResults);

  }

  removeDuplicate(arr: Array<any>): Array<any> {
    let uniqeResults: Set<any> = new Set<any>();
    arr.forEach(val => uniqeResults.add(val));

    return Array.from(uniqeResults)

  }

  releventNotes(query: string): Array<Note> {
    query = query.toLowerCase().trim();
    let releventNotes = this.notes.filter(note => {
      if (note.title && note.title.toLowerCase().includes(query)) {
        return true;
      }
      if (note.body && note.body.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    })
    return releventNotes;
  }

  sortByRelevancy(searchResults: Note[]) {
    // this method will calculate the relvancy of a note
    let noteCountObject: object = {};

    searchResults.forEach(note => {
      let noteId = this.notesService.getId(note);
      noteCountObject[noteId] = noteCountObject[noteId] + 1 || 1;
    })

    this.filteredNotes = this.filteredNotes.sort((a: Note,b: Note) => {
      let aId = this.notesService.getId(a);
      let bId = this.notesService.getId(b);

      let aCount = noteCountObject[aId];
      let bCount = noteCountObject[bId];

      return bCount - aCount
    })
  }

}
