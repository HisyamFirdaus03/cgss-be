var authKey = ''
$(document).ready(function () {
  let searchParams = new URLSearchParams(window.location.search)
  if (searchParams.has('key')) {
    authKey = searchParams.get('key')
  }

  $('#pwd').on('click', (e) => {
    e.preventDefault()
    $('#alertBox').alert('close')
    var pwd1 = $('#pwd1').val()
    var pwd2 = $('#pwd2').val()
    if (pwd1 !== pwd2) {
      $('#errorAlert').append(`
      <div id="alertBox" class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error !</strong> Passwords do not match!.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      `)
      return
    }
    const strength = passwordStrength(pwd1).value
    if (strength !== 'Medium' && strength != 'Strong') {
      $('#errorAlert').append(`
      <div id="alertBox" class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error !</strong> Your password is ${strength}.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      `)
      return
    }
    $('#alertBox').alert('close')
    submitNewPassword(authKey, pwd1)
  })
})

const submitNewPassword = async (key, password) => {
  try {
    $('#errorAlert').empty()
    $('#errorAlert').append(`
      <div class="alert alert-info" role="alert">
        Please wait ...
      </div>
    `)
    const response = await axios.post(
      '/api/v1/users/reset-password',
      { password: password },
      {
        headers: {
          Authorization: key,
        },
      }
    )
    $('#pwd1').val('')
    $('#pwd2').val('')
    $('#errorAlert').empty()
    $('#errorAlert').append(`
      <div class="alert alert-success" role="alert">
        <strong>Success !</strong> ${response.data}.
      </div>
    `)
  } catch (e) {
    $('#errorAlert').empty()
    $('#errorAlert').append(`
    <div id="alertBox" class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error !</strong> ${e.response.data.error.message}.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    `)
  }
}
