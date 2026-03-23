import { createDashboardOptions } from './dashboard/options.js';

const { createApp } = Vue;

createApp(createDashboardOptions()).mount('#dashboard-app');
