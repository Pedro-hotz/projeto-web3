if (window.flashMessage) {
  Swal.fire({
    icon: window.flashMessage.icon,
    title: window.flashMessage.title,
    showConfirmButton: true,
    // timer: 2000
  });
}