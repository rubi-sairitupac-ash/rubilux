import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '..');
const remoteUrl = 'https://github.com/rubi-sairitupac-ash/rubilux.git';

async function sync() {
  console.log('📦 Inicializando repositorio Git en:', projectDir);
  
  const gitDir = path.join(projectDir, '.git');
  if (!fs.existsSync(gitDir)) {
    await git.init({ fs, dir: projectDir, defaultBranch: 'main' });
    console.log('✅ Repositorio Git inicializado con rama "main".');
  }

  try {
    await git.addRemote({ fs, dir: projectDir, remote: 'origin', url: remoteUrl, force: true });
    console.log(`✅ Remote origin configurado: ${remoteUrl}`);
  } catch (e) {}

  const filesToAdd = [
    'index.html',
    'package.json',
    'vite.config.js',
    'vercel.json',
    '.gitignore',
    '.env.example',
    'README.md',
    'public/img/logo.png',
    'src/main.jsx',
    'src/App.jsx',
    'src/index.css',
    'src/components/Login.jsx',
    'src/components/Navbar.jsx',
    'src/components/Home.jsx',
    'src/components/Clientes.jsx',
    'src/components/Empleado.jsx',
    'src/components/Producto.jsx',
    'src/components/RegistrarVenta.jsx',
    'server/app.js',
    'server/db.js',
    'server/index.js',
    'api/index.js',
    'base/db_ventas.sql',
    'base/mi_base.sql',
    'scripts/git-sync.js'
  ];

  for (const f of filesToAdd) {
    const fullPath = path.join(projectDir, f);
    if (fs.existsSync(fullPath)) {
      await git.add({ fs, dir: projectDir, filepath: f });
    }
  }
  console.log('✅ Archivos agregados al staging de Git.');

  try {
    const sha = await git.commit({
      fs,
      dir: projectDir,
      author: {
        name: 'Rubi Sairitupac',
        email: 'rubisairitupac@users.noreply.github.com'
      },
      message: 'feat: Replica completa del Sistema de Ventas NetBeans en React JS con Bootstrap y MySQL mi_base'
    });
    console.log(`✅ Commit creado exitosamente: ${sha}`);
  } catch (e) {
    console.log('ℹ️ Commit:', e.message);
  }

  const token = process.env.GITHUB_TOKEN || process.argv[2];
  if (token) {
    console.log('🚀 Subiendo cambios a GitHub...');
    try {
      const pushResult = await git.push({
        fs,
        http,
        dir: projectDir,
        remote: 'origin',
        ref: 'main',
        force: true,
        onAuth: () => ({ username: token })
      });
      console.log('🎉 ¡Proyecto React subido exitosamente a GitHub!');
      console.log(pushResult);
    } catch (err) {
      console.error('❌ Error al subir a GitHub:', err.message);
    }
  } else {
    console.log('\n📌 Repositorio local preparado y commiteado.');
    console.log('Para subir a GitHub, ejecuta: node scripts/git-sync.js <TOKEN>');
  }
}

sync().catch(err => console.error('Error:', err));
