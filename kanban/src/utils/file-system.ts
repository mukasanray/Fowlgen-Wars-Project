import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export class FileSystemUtils {
  static readFile(filePath: string): string {
    if (!this.fileExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf8');
  }

  static writeFile(filePath: string, content: string): void {
    const dir = path.dirname(filePath);
    if (!this.directoryExists(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }

  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  }

  static directoryExists(dirPath: string): boolean {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  }

  static getDirectories(dirPath: string): string[] {
    if (!this.directoryExists(dirPath)) {
      return [];
    }
    return fs.readdirSync(dirPath)
      .filter(item => this.directoryExists(path.join(dirPath, item)));
  }

  static getFiles(dirPath: string): string[] {
    if (!this.directoryExists(dirPath)) {
      return [];
    }
    return fs.readdirSync(dirPath)
      .filter(item => this.fileExists(path.join(dirPath, item)));
  }

  static executeShellCommand(command: string): string {
    return execSync(command, { encoding: 'utf8' }).toString().trim();
  }

  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static log(message: string): void {
    console.log(message);
  }

  static error(message: string): void {
    console.error(message);
  }
}