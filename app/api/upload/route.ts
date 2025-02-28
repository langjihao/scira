import { writeFile, mkdir } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const uploadedFile = formData.get('file');
    
    if (!uploadedFile || !(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!uploadedFile.type.includes('pdf')) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const bytes = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    await writeFile(
      join(uploadDir, uploadedFile.name),
      buffer
    );

    return NextResponse.json({ 
      message: "File uploaded successfully",
      fileName: uploadedFile.name
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
} 