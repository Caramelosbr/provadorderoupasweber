const nodemailer = require('nodemailer');

// Criar transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Enviar email
 * @param {Object} options - Opções do email
 * @param {string} options.to - Destinatário
 * @param {string} options.subject - Assunto
 * @param {string} options.html - Conteúdo HTML
 * @param {string} options.text - Conteúdo texto
 */
exports.sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Provador Virtual IA" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email de boas-vindas
 */
exports.sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Bem-vindo ao Provador Virtual IA!</h1>
    <p>Olá ${user.name},</p>
    <p>Sua conta foi criada com sucesso!</p>
    <p>Agora você pode experimentar roupas virtualmente antes de comprar.</p>
    <p>Acesse: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
  `;

  return this.sendEmail({
    to: user.email,
    subject: 'Bem-vindo ao Provador Virtual IA!',
    html
  });
};

/**
 * Email de recuperação de senha
 */
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <h1>Recuperação de Senha</h1>
    <p>Olá ${user.name},</p>
    <p>Você solicitou a recuperação de senha.</p>
    <p>Clique no link abaixo para criar uma nova senha:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>Este link expira em 1 hora.</p>
    <p>Se você não solicitou esta recuperação, ignore este email.</p>
  `;

  return this.sendEmail({
    to: user.email,
    subject: 'Recuperação de Senha - Provador Virtual IA',
    html
  });
};

/**
 * Email de confirmação de pedido
 */
exports.sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.variant?.size || '-'}</td>
      <td>${item.quantity}</td>
      <td>R$ ${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <h1>Pedido Confirmado!</h1>
    <p>Olá ${user.name},</p>
    <p>Seu pedido <strong>#${order.orderNumber}</strong> foi confirmado!</p>
    
    <h2>Itens do Pedido</h2>
    <table border="1" cellpadding="10">
      <tr>
        <th>Produto</th>
        <th>Tamanho</th>
        <th>Qtd</th>
        <th>Preço</th>
      </tr>
      ${itemsHtml}
    </table>
    
    <p><strong>Total: R$ ${order.pricing.total.toFixed(2)}</strong></p>
    
    <h2>Endereço de Entrega</h2>
    <p>
      ${order.shippingAddress.street}, ${order.shippingAddress.number}<br>
      ${order.shippingAddress.neighborhood}<br>
      ${order.shippingAddress.city} - ${order.shippingAddress.state}<br>
      CEP: ${order.shippingAddress.zipCode}
    </p>
    
    <p>Acompanhe seu pedido em: <a href="${process.env.FRONTEND_URL}/pedidos/${order._id}">${process.env.FRONTEND_URL}/pedidos/${order._id}</a></p>
  `;

  return this.sendEmail({
    to: user.email,
    subject: `Pedido #${order.orderNumber} Confirmado - Provador Virtual IA`,
    html
  });
};

/**
 * Email de atualização de status do pedido
 */
exports.sendOrderStatusEmail = async (user, order, status) => {
  const statusMessages = {
    paid: 'Pagamento confirmado',
    processing: 'Pedido em preparação',
    shipped: 'Pedido enviado',
    delivered: 'Pedido entregue',
    cancelled: 'Pedido cancelado'
  };

  const html = `
    <h1>Atualização do Pedido #${order.orderNumber}</h1>
    <p>Olá ${user.name},</p>
    <p>Seu pedido teve uma atualização de status:</p>
    <p><strong>${statusMessages[status] || status}</strong></p>
    ${order.shipping?.trackingCode ? `<p>Código de rastreio: <strong>${order.shipping.trackingCode}</strong></p>` : ''}
    <p>Acompanhe seu pedido em: <a href="${process.env.FRONTEND_URL}/pedidos/${order._id}">${process.env.FRONTEND_URL}/pedidos/${order._id}</a></p>
  `;

  return this.sendEmail({
    to: user.email,
    subject: `Atualização do Pedido #${order.orderNumber} - Provador Virtual IA`,
    html
  });
};