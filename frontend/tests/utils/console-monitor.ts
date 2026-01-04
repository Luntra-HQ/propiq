import { Page, ConsoleMessage } from '@playwright/test';

export interface ConsoleLog {
  timestamp: string;
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  location?: string;
  args?: any[];
}

export class ConsoleMonitor {
  private logs: ConsoleLog[] = [];
  private errors: ConsoleLog[] = [];
  private warnings: ConsoleLog[] = [];

  constructor(private page: Page) {
    this.setupListeners();
  }

  private setupListeners() {
    // Capture console messages
    this.page.on('console', (msg: ConsoleMessage) => {
      const log: ConsoleLog = {
        timestamp: new Date().toISOString(),
        type: msg.type() as any,
        message: msg.text(),
        location: msg.location().url,
        args: msg.args().map(arg => arg.toString())
      };

      this.logs.push(log);

      if (msg.type() === 'error') {
        this.errors.push(log);
      } else if (msg.type() === 'warning') {
        this.warnings.push(log);
      }
    });

    // Capture page errors
    this.page.on('pageerror', (error) => {
      const log: ConsoleLog = {
        timestamp: new Date().toISOString(),
        type: 'error',
        message: error.message,
        location: error.stack
      };
      this.errors.push(log);
      this.logs.push(log);
    });

    // Capture unhandled rejections
    this.page.on('requestfailed', (request) => {
      const log: ConsoleLog = {
        timestamp: new Date().toISOString(),
        type: 'error',
        message: `Request failed: ${request.url()} - ${request.failure()?.errorText}`,
        location: request.url()
      };
      this.errors.push(log);
      this.logs.push(log);
    });
  }

  getAllLogs(): ConsoleLog[] {
    return this.logs;
  }

  getErrors(): ConsoleLog[] {
    return this.errors;
  }

  getWarnings(): ConsoleLog[] {
    return this.warnings;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  exportToJSON(filepath: string): void {
    const fs = require('fs');
    const path = require('path');
    const dir = path.dirname(filepath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const report = {
      capturedAt: new Date().toISOString(),
      summary: {
        totalLogs: this.logs.length,
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      logs: this.logs,
      errors: this.errors,
      warnings: this.warnings
    };
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  }

  printSummary(): void {
    console.log('\n📊 Console Log Summary:');
    console.log(`   Total logs: ${this.logs.length}`);
    console.log(`   ❌ Errors: ${this.errors.length}`);
    console.log(`   ⚠️  Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n🚨 Console Errors Detected:');
      this.errors.forEach((err, i) => {
        console.log(`\n   Error ${i + 1}/${this.errors.length}:`);
        console.log(`   Time: ${err.timestamp}`);
        console.log(`   Message: ${err.message}`);
        if (err.location) console.log(`   Location: ${err.location}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Console Warnings Detected:');
      this.warnings.forEach((warn, i) => {
        console.log(`\n   Warning ${i + 1}/${this.warnings.length}:`);
        console.log(`   Time: ${warn.timestamp}`);
        console.log(`   Message: ${warn.message}`);
      });
    }
  }

  clear(): void {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
  }
}
