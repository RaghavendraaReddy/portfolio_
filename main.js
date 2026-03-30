/* ===== CUSTOM CURSOR ===== */
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursor-trail');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
  setTimeout(() => {
    trail.style.left = mouseX + 'px';
    trail.style.top = mouseY + 'px';
  }, 80);
});

document.querySelectorAll('a, button, .skill-card, .project-card, .contact-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
    cursor.style.background = 'var(--cyan)';
    trail.style.width = '50px';
    trail.style.height = '50px';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursor.style.background = 'var(--purple)';
    trail.style.width = '36px';
    trail.style.height = '36px';
  });
});

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* ===== ROLE CYCLE ===== */
const roles = ['Backend Systems', 'RESTful APIs', 'Scalable Apps', 'Cloud Infrastructure', 'Observability Tools'];
let roleIdx = 0;
const roleCycle = document.getElementById('role-cycle');

function cycleRole() {
  roleCycle.style.opacity = '0';
  roleCycle.style.transform = 'translateY(10px)';
  setTimeout(() => {
    roleIdx = (roleIdx + 1) % roles.length;
    roleCycle.textContent = roles[roleIdx];
    roleCycle.style.transition = 'opacity 0.4s, transform 0.4s';
    roleCycle.style.opacity = '1';
    roleCycle.style.transform = 'translateY(0)';
  }, 350);
}

roleCycle.style.transition = 'opacity 0.4s, transform 0.4s';
setInterval(cycleRole, 2800);

/* ===== THREE.JS 3D PARTICLE BACKGROUND ===== */
(function initThree() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  /* --- Particle Field --- */
  const particleCount = 1800;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const palette = [
    new THREE.Color('#8b5cf6'),
    new THREE.Color('#06b6d4'),
    new THREE.Color('#ec4899'),
    new THREE.Color('#a78bfa'),
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.022,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* --- Floating Geometry --- */
  function makeFloat(geom, col, x, y, z, rotSpeed) {
    const m = new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.18 });
    const mesh = new THREE.Mesh(geom, m);
    mesh.position.set(x, y, z);
    mesh.userData.rotSpeed = rotSpeed;
    scene.add(mesh);
    return mesh;
  }

  const shapes = [
    makeFloat(new THREE.IcosahedronGeometry(0.8, 1), 0x8b5cf6, -4.5, 2, -2, { x: 0.003, y: 0.005 }),
    makeFloat(new THREE.OctahedronGeometry(0.6, 0),  0x06b6d4,  4.2, -1.5, -1, { x: -0.004, y: 0.003 }),
    makeFloat(new THREE.TetrahedronGeometry(0.5, 0), 0xec4899, -2, -2.5, -3, { x: 0.006, y: -0.004 }),
    makeFloat(new THREE.TorusGeometry(0.5, 0.15, 8, 16), 0xa78bfa, 3, 2.5, -2, { x: 0.002, y: 0.007 }),
  ];

  /* --- Grid Plane --- */
  const gridHelper = new THREE.GridHelper(30, 40, 0x8b5cf6, 0x8b5cf6);
  gridHelper.material.opacity = 0.04;
  gridHelper.material.transparent = true;
  gridHelper.position.y = -5;
  scene.add(gridHelper);

  /* --- Mouse Parallax --- */
  let targetX = 0, targetY = 0;
  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  /* --- Animate --- */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    // Rotate particle field slowly
    particles.rotation.y += 0.0006;
    particles.rotation.x += 0.0002;

    // Parallax camera
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (-targetY - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    // Animate shapes
    shapes.forEach((s, i) => {
      s.rotation.x += s.userData.rotSpeed.x;
      s.rotation.y += s.userData.rotSpeed.y;
      s.position.y += Math.sin(t + i * 1.5) * 0.004;
    });

    // Pulse grid
    gridHelper.material.opacity = 0.03 + Math.sin(t) * 0.01;

    renderer.render(scene, camera);
  }
  animate();

  /* --- Resize --- */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ===== INTERSECTION OBSERVER — Scroll Animations ===== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay || 0;
      setTimeout(() => el.classList.add('visible'), parseInt(delay));
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-card, .project-card, .timeline-item').forEach(el => {
  observer.observe(el);
});

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===== ACTIVE NAV LINK ===== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 200) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--text)' : '';
  });
});
