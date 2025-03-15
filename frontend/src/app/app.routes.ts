import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { GestureEditorComponent } from './components/gesture-editor/gesture-editor.component';
import { RecognizerComponent } from './components/recognizer/recognizer.component';

export const routes: Routes = [ 
    { path: 'auth', component: AuthComponent },
    { path: 'gestures', component: GestureEditorComponent },
    { path: 'recognizer', component: RecognizerComponent },
];
