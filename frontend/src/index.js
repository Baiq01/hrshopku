import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';

const root = createRoot(document.getElementById('root'));
root.render(
	<BrowserRouter>
		<ToastProvider>
			<ConfirmProvider>
				<App />
			</ConfirmProvider>
		</ToastProvider>
	</BrowserRouter>
);
