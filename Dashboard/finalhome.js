import supabase from '../supabase.js';


// -------------------------ALERT FUNCTION----------------------------

function showAlert(type, message) {
  const alert = document.getElementById(`alert-${type}`);
  if (alert) {
    alert.querySelector('.message').textContent = message;
    alert.style.display = 'flex';
    setTimeout(() => {
      alert.style.display = 'none';
    }, 5000);
  }
}

// // -----------------Fetch data from the database----------------------


document.addEventListener('DOMContentLoaded', () => {
  const submitBtn = document.querySelector("#submitBtn");
  const fName = document.getElementById('fName');
  const lName = document.getElementById('lName');
  const age = document.getElementById('age');
  const city = document.getElementById('city');
  const position = document.getElementById('position');
  const salary = document.getElementById('salary');
  const sDate = document.getElementById('sDate');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const darkBg = document.getElementById('darkBg');
  const popupForm = document.getElementById('popupForm');
  const form = document.querySelector('#myForm');
  const imgInput = document.querySelector("#imgInput");
  const uploadImgInput = document.querySelector("#uploadimg");
  const imgHolder = document.getElementById('imgHolder');

  // Image preview on upload
  uploadImgInput.addEventListener('change', function (e) {
    const reader = new FileReader();

    reader.onload = function (event) {
      imgInput.src = event.target.result;
      imgHolder.style.display = 'block';
    };

    reader.readAsDataURL(e.target.files[0]);
  });

  // Function to check for duplicate email or phone
  async function checkDuplicates(emailValue, phoneValue) {
    const { data, error } = await supabase
      .from('users_profiles_duplicate')
      .select('email, phone')
      .or(`email.eq.${emailValue},phone.eq.${phoneValue}`);

    if (error) {
      console.error("Error checking duplicates:", error);
      return false;
    }

    return data.length > 0; // Return true if duplicates are found
  }

  // Function to handle user addition to database
  async function addUser(event) {
    event.preventDefault();

    const information = {
      picture: imgInput.src,
      fName: fName.value.trim(),
      lName: lName.value.trim(),
      age: age.value.trim(),
      city: city.value.trim(),
      position: position.value.trim(),
      salary: salary.value.trim(),
      sDate: sDate.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
    };

    // Check for duplicates
    const isDuplicate = await checkDuplicates(information.email, information.phone);

    if (isDuplicate) {
      showAlert('error', "Email or phone number already exists. Please provide a new email and phone number.");
      return;
    }

    // Add the new user to the database
    const { data, error } = await supabase
      .from('users_profiles_duplicate')
      .insert([information]);

    if (error) {
      console.error("Error adding data:", error);
      showAlert('error', "Failed to add user. Please try again.");
      return;
    }

    showAlert('success', "User added successfully!");
    form.reset();
    darkBg.classList.remove('active');
    popupForm.classList.remove('active');
    showInfo();
  }

  // Close popup form
  document.getElementById('closeBtn').addEventListener('click', () => {
    darkBg.classList.remove('active');
    popupForm.classList.remove('active');
    form.reset();
  });

  // Open form for adding a new user
  document.getElementById('newMemberAddBtn').addEventListener('click', () => {
    darkBg.classList.add('active');
    popupForm.classList.add('active');
    form.reset();
  });

  // Bind submit event
  submitBtn.addEventListener('click', addUser);

  // Initial load
  showInfo();
});



// ---------------------------------EDIT FORM FUNCTION---------------------------------------

window.editInfo = async function (
  id, pic, fname, lname, Age, City, Position, Salary, SDate, Email, Phone) {
  if (!id || id < 1) {
    console.log("Invalid ID:", id);
    showAlert('error', "Invalid ID, unable to fetch the record.");
    return;
  }

  try {
    // Fetch existing record
    const { data: record, error } = await supabase
      .from("users_profiles_duplicate")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !record) {
      console.log("Error fetching record:", error || "No matching record found.");
      showAlert('error', "No record found with this ID.");
      return;
    }

    // Pre-fill form fields
    document.getElementById("fName").value = record.fName || fname;
    document.getElementById("lName").value = record.lName || lname;
    document.getElementById("age").value = record.age || Age;
    document.getElementById("city").value = record.city || City;
    document.getElementById("position").value = record.position || Position;
    document.getElementById("salary").value = record.salary || Salary;
    document.getElementById("sDate").value = record.sDate || SDate;
    document.getElementById("email").value = record.email || Email;
    document.getElementById("phone").value = record.phone || Phone;
    document.getElementById("imgInput").src = record.picture || pic || "./img/default.png";

    // Image upload and preview logic
    const imgInputField = document.getElementById("imgInputField");
    imgInputField.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          document.getElementById("imgInput").src = e.target.result; // Update image preview
        };
        reader.readAsDataURL(file);
      }
    });

    // Show modal with pre-filled data
    document.getElementById("darkBg").classList.add("active");
    document.getElementById("popupForm").classList.add("active");
    document.getElementById("popupFooter").style.display = "block";
    document.getElementById("modalTitle").innerHTML = "Update the Form";
    document.getElementById("submitBtn").innerHTML = "Update";

    // Remove previous event listeners
    const oldSubmitBtn = document.getElementById("submitBtn");
    const newSubmitBtn = oldSubmitBtn.cloneNode(true); // Clone button to clear listeners
    oldSubmitBtn.parentNode.replaceChild(newSubmitBtn, oldSubmitBtn);

    // Attach new event listener for update
    newSubmitBtn.addEventListener("click", async function (event) {
      event.preventDefault();

      const updatedData = {
        fName: document.getElementById("fName").value,
        lName: document.getElementById("lName").value,
        age: document.getElementById("age").value,
        city: document.getElementById("city").value,
        position: document.getElementById("position").value,
        salary: document.getElementById("salary").value,
        sDate: document.getElementById("sDate").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        picture: document.getElementById("imgInput").src,
      };

      // Update query for the specific row
      const { error: updateError } = await supabase
        .from("users_profiles_duplicate")
        .update(updatedData)
        .eq("id", id);

      if (updateError) {
        console.error("Error updating record:", updateError);
        showAlert('error', "Failed to update the record. Please try again.");
        return;
      }

      showAlert('success', "Record updated successfully!");

      // Close modal
      document.getElementById("darkBg").classList.remove("active");
      document.getElementById("popupForm").classList.remove("active");

      // Auto-refresh the screen
      window.location.reload(); // Refresh the page to reflect updated data
    });
  } catch (err) {
    console.error("Unexpected error:", err.message);
    showAlert('error', "An unexpected error occurred while fetching the record. Please try again.");
  }
};



// ----------------DELETE FUNCTION-------------



window.deleteInfo = async function (index) {
  try {
    // Fetch user data
    const { data: userData, error: fetchError } = await supabase
      .from('users_profiles_duplicate')
      .select('*')
      .order('id', { ascending: true }); // Order data by ID

    if (fetchError) {
      console.error('Error fetching user data for deletion:', fetchError);
      showAlert('error', 'Failed to fetch user data. Please try again.');
      return;
    }

    if (!userData || userData.length === 0) {
      console.error('Error fetching user data for deletion: No data found in the table.');
      showAlert('error', 'No users found. Please try again later.');
      return;
    }

    // Validate index
    if (index < 0 || index >= userData.length) {
      console.error('Invalid index provided for deletion.');
      showAlert('error', 'Invalid user selected. Please try again.');
      return;
    }

    const userId = userData[index].id;

    // Delete the user from the database
    const { error: deleteError } = await supabase
      .from('users_profiles_duplicate')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Error deleting user from database:', deleteError);
      showAlert('error', 'Failed to delete user from the database. Please try again.');
      return;
    }

    showAlert('success', 'User deleted successfully!');

    // Auto-refresh the screen
    window.location.reload();
  } catch (err) {
    console.error('Unexpected error while deleting user:', err.message);
    showAlert('error', 'An unexpected error occurred. Please try again.');
  }
};



// -------------VIEW DATA FUNCTION-------------


// Step 1: Fetch user data from Supabase using user ID
window.readInfo = async function (userId) {
  try {
    // Fetch data from Supabase database table 'profiles'
    const { data, error } = await supabase
      .from('users_profiles_duplicate') // Database table name
      .select('*')
      .eq('id', userId) // Filter by User ID
      .single(); // Fetch only a single record

    if (error) {
      console.log("Error fetching data:", error);
      return;
    }

    // If data is fetched successfully, pass it to the function for displaying
    if (data) {
      displayUserInfo(
        data.picture,
        data.fName,
        data.lName,
        data.age,
        data.city,
        data.position,
        data.salary,
        data.sDate,
        data.email,
        data.phone
      );
    }
  } catch (err) {
    console.log("Unexpected error:", err);
  }
}

// Step 2: Display user information in a form
function displayUserInfo(pic, fname, lname, userAge, userCity, userPosition, userSalary, userSDate, userEmail, userPhone) {
  // Get form elements
  const imgInput = document.getElementById("imgInput");
  const fName = document.getElementById("fName");
  const lName = document.getElementById("lName");
  const age = document.getElementById("age");
  const city = document.getElementById("city");
  const position = document.getElementById("position");
  const salary = document.getElementById("salary");
  const sDate = document.getElementById("sDate");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");

  const darkBg = document.getElementById("darkBg");
  const popupForm = document.getElementById("popupForm");
  const popupFooter = document.getElementById("popupFooter");
  const modalTitle = document.getElementById("modalTitle");
  const formInputFields = document.querySelectorAll(".form-input"); // Assuming all input fields have this class
  const imgHolder = document.getElementById("imgHolder");

  // Get all form elements (inputs, textareas, select, buttons, etc.)
  const formElements = document.querySelectorAll('input, textarea, select');

  // Fill form fields with data
  imgInput.src = pic;
  fName.value = fname;
  lName.value = lname;
  age.value = userAge;
  city.value = userCity;
  position.value = userPosition;
  salary.value = userSalary;
  sDate.value = userSDate;
  email.value = userEmail;
  phone.value = userPhone;

  // Style and modal adjustments
  darkBg.classList.add('active');  // Show dark background
  popupForm.classList.add('active');  // Show the popup form
  popupFooter.style.display = "none";  // Hide footer (optional)
  modalTitle.innerHTML = "Profile";  // Set modal title to 'Profile'

  // Disable all form elements
  formElements.forEach(element => {
    element.disabled = true;  // Disable the element
  });

  // Disable image editing (optional)
  // imgHolder.style.pointerEvents = "none";  // Make image uneditable
}





// ------------------EXTRA CONTENT-------------------




// Define the showInfo function (you can customize this logic)
function showInfo() {
  // Example logic to show information (adjust as needed)
  // console.log('Displaying information after form submission');
  // Update any DOM elements, like:
  // document.querySelector('.infoDisplay').innerHTML = "Form submitted successfully!";
}

// Define the displayIndexBtn function
function displayIndexBtn() {
  // Example logic to display the index button (customize as needed)
  console.log('Index button is being displayed');
  const indexBtn = document.querySelector('.indexBtn');
  if (indexBtn) {
    indexBtn.style.display = 'block';  // Adjust display behavior as necessary
  }
}

// Define the highlightIndexBtn function
function highlightIndexBtn() {
  const indexBtn = document.querySelector('.indexBtn'); // Adjust selector as necessary
  if (indexBtn) {
    indexBtn.classList.add('highlight');
  } else {
    console.log('Index button not found');
  }
}


function next() {
  var prevBtn = document.querySelector('.prev')
  var nextBtn = document.querySelector('.next')

  if (currentIndex <= maxIndex - 1) {
    currentIndex++
    prevBtn.classList.add("act")

    highlightIndexBtn()
  }

  if (currentIndex > maxIndex - 1) {
    nextBtn.classList.remove("act")
  }
}


function prev() {
  var prevBtn = document.querySelector('.prev')

  if (currentIndex > 1) {
    currentIndex--
    prevBtn.classList.add("act")
    highlightIndexBtn()
  }

  if (currentIndex < 2) {
    prevBtn.classList.remove("act")
  }
}




function paginationBtn(i) {
  currentIndex = i

  var prevBtn = document.querySelector('.prev')
  var nextBtn = document.querySelector('.next')

  highlightIndexBtn()

  if (currentIndex > maxIndex - 1) {
    nextBtn.classList.remove('act')
  }
  else {
    nextBtn.classList.add("act")
  }


  if (currentIndex > 1) {
    prevBtn.classList.add("act")
  }

  if (currentIndex < 2) {
    prevBtn.classList.remove("act")
  }
}



// ---------------------EXACT SHOW DATA BY SELECTING NUMBER OF DATA------------------------


document.addEventListener('DOMContentLoaded', () => {
  const entries = document.querySelector(".showEntries");
  const userInfo = document.querySelector(".userInfo");
  const pagination = document.querySelector(".pagination");
  let currentPage = 1;
  let rowsPerPage = 10;
  let originalData = [];

  // Fetch Data from Supabase
  async function fetchData() {
    try {
      const { data, error } = await supabase.from('users_profiles_duplicate').select('*');
      if (error) throw new Error("Error fetching data:", error);
      originalData = data;
      renderTable();
      setupPagination();
    } catch (err) {
      console.error("Error in fetchData:", err.message);
    }
  }

  // Render Table Data
  function renderTable() {
    userInfo.innerHTML = ""; // Clear table content
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = originalData.slice(start, end);

    if (paginatedData.length > 0) {
      paginatedData.forEach((staff, i) => {
        userInfo.innerHTML += `
          <tr class="employeeDetails">
            <td>${start + i + 1}</td>
            <td><img src="${staff.picture || './img/default-profile-account.jpg'}" alt="" width="40" height="40"></td>
            <td>${staff.fName} ${staff.lName}</td>
            <td>${staff.age}</td>
            <td>${staff.city}</td>
            <td>${staff.position}</td>
            <td>${staff.salary}</td>
            <td>${staff.sDate}</td>
            <td>${staff.email}</td>
            <td>${staff.phone}</td>
            <td>
              <button onclick="readInfo('${staff.id}')"><i class="fa-regular fa-eye"></i></button>
              <button onclick="editInfo('${staff.id}')"><i class="fa-regular fa-pen-to-square"></i></button>
              <button onclick="deleteInfo(${i})"><i class="fa-regular fa-trash-can"></i></button>
            </td>
          </tr>`;
      });
    } else {
      userInfo.innerHTML = `<tr><td colspan="11" align="center">No data available</td></tr>`;
    }
  }

  


  // Setup Pagination with Next and Previous Buttons
  function setupPagination() {
    pagination.innerHTML = ""; // Clear pagination buttons
    const totalPages = Math.ceil(originalData.length / rowsPerPage);

    if (totalPages <= 1) return; // If only one page, no need for pagination

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1; // Disable if on the first page
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();  // Re-render table with updated page
        setupPagination();  // Re-render pagination with updated page
      }
    });
    pagination.appendChild(prevButton);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.classList.add('page-btn');
      if (i === currentPage) pageButton.classList.add('active');
      pageButton.addEventListener('click', () => {
        currentPage = i;  // Set current page to clicked page
        renderTable();  // Re-render table with updated page
        setupPagination();  // Re-render pagination with updated page
      });
      pagination.appendChild(pageButton);
    }

    // Next Button
    const nextButton = document.createElement('button');
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages; // Disable if on the last page
    nextButton.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();  // Re-render table with updated page
        setupPagination();  // Re-render pagination with updated page
      }
    });
    pagination.appendChild(nextButton);
  }

  // Update Rows Per Page
  entries.addEventListener('change', (e) => {
    rowsPerPage = parseInt(e.target.value);
    currentPage = 1; // Reset to the first page
    if (originalData.length > 0) {
      renderTable();
      setupPagination();
    } else {
      userInfo.innerHTML = `<tr><td colspan="11" align="center">No data available</td></tr>`;
    }
  });

  // Initial Data Load
  fetchData();
});


//--------------------------- SEARCH FUNCTION------------------------------

// Attach event listener to the search input
document.getElementById("filterData").addEventListener("input", filterUserInfo);

async function filterUserInfo() {
  const searchTerm = document.getElementById("filterData").value.toLowerCase();

  try {
    // Fetch data from Supabase
    const { data, error } = await supabase.from("users_profiles_duplicate").select("*");

    if (error) {
      console.error("Error fetching data:", error);
      showAlert('error', "Failed to fetch data. Please try again.");
      return;
    }

    // Filter data based on search term
    const filteredData = data.filter(user =>
      user.fName.toLowerCase().includes(searchTerm) ||
      user.lName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.phone.toLowerCase().includes(searchTerm)
    );

    // Update the table to display filtered data
    const userInfo = document.querySelector(".userInfo");
    userInfo.innerHTML = ""; // Clear current table rows

    if (filteredData.length > 0) {
      filteredData.forEach((staff, i) => {
        const createElement = `
          <tr class="employeeDetails">
              <td>${i + 1}</td>
              <td><img src="${staff.picture || './img/default-profile-account.jpg'}" alt="" width="40" height="40"></td>
              <td>${staff.fName} ${staff.lName}</td>
              <td>${staff.age}</td>
              <td>${staff.city}</td>
              <td>${staff.position}</td>
              <td>${staff.salary}</td>
              <td>${staff.sDate}</td>
              <td>${staff.email}</td>
              <td>${staff.phone}</td>
              <td>
                  <button onclick="readInfo('${staff.id}', '${staff.picture}', '${staff.fName}', '${staff.lName}', '${staff.age}', '${staff.city}', '${staff.position}', '${staff.salary}', '${staff.sDate}', '${staff.email}', '${staff.phone}')"><i class="fa-regular fa-eye"></i></button>
                  <button onclick="editInfo('${staff.id}', '${staff.picture}', '${staff.fName}', '${staff.lName}', '${staff.age}', '${staff.city}', '${staff.position}', '${staff.salary}', '${staff.sDate}', '${staff.email}', '${staff.phone}')"><i class="fa-regular fa-pen-to-square"></i></button>
                  <button onclick="deleteInfo(${i})"><i class="fa-regular fa-trash-can"></i></button>
              </td>
          </tr>`;
        userInfo.innerHTML += createElement;
      });
    } else {
      userInfo.innerHTML = `<tr class="employeeDetails"><td class="empty" colspan="11" align="center">No matching data found</td></tr>`;
    }
  } catch (err) {
    console.error("Error filtering data:", err.message);
    showAlert('error', "An error occurred while filtering data. Please try again.");
  }
}



//------------------------ NAV BAR ------------------------

// // Profile button functionality
// document.getElementById('profile').addEventListener('click', () => {
//   window.location.href = '/profile/profile.html'; // Redirect to the profile page
// });


// Profile button functionality
document.getElementById('profile').addEventListener('click', (event) => {
  event.preventDefault(); // Prevent default action if needed (useful if button is within a form or link)
  window.location.href = '/profile/profile.html'; // Redirect to the profile page
});


// Logout button functionality
document.getElementById('logout').addEventListener('click', async () => {
  const confirmation = confirm("Are you sure you want to log out?");
  if (confirmation) {
    // Perform logout logic
    const { error } = await supabase.auth.signOut();
    if (!error) {
      alert('You have been logged out.');
      window.location.href = '/index.html'; // Redirect to login page
    } else {
      console.error('Logout error:', error.message);
    }
  }
});
