number_of_subnets = 0

let subnets = []

let start_square = null;

const size_to_masks = { 256:   ["24", 0],
                        128:   ["25", 128],
                        64:    ["26", 192],
                        32:    ["27", 224],
                        16:    ["28", 240],
                        8:     ["29", 248],
                        4:     ["30", 252],
}

add_subnet("A", 120);
add_subnet("B", 60);
add_subnet("C", 20);
add_subnet("D", 14);                  //used for testing
add_subnet("E", 6);
add_subnet("F", 2);
add_subnet("G", 2);

function save_network() {

    var ip = document.getElementById("network_input").value;
    
    set_ip(ip)
    
    start_square = null
    get_start_square(get_mask());
    calculate()
    check_networks(document.getElementById("network_input"))
}

function check_networks(input) {

    let saved_ip = document.getElementById("saved_network")

    saved_ip.style = "";

    if (input.value != saved_ip.innerHTML) {
        saved_ip.style = "color: orange;"
    }

}

function set_ip(ip) {
    document.getElementById("saved_network").innerHTML = ip

    return
}

function get_ip() {
    
    ip = document.getElementById("saved_network").innerHTML
    ip = ip.split("/")[0].split(".");
    console.log(ip);
    return ip
}

function get_mask() {
    return parseInt(document.getElementById("network_input").value.split("/")[1]);
}

function get_start_square(mask) {
    document.getElementById("vlsm_square").innerHTML = ""
    document.getElementById("result").innerHTML = "";

    if (mask < 24 || mask > 30) {
        set_ip("<red_text>neplatná maska - platné masky: 24 až 30</red_text>")
        mask = 24
    }

    if (mask === 24) {
        var start_squares = [   {"square": document.getElementById("vlsm_square"),
                                 "capacity": 256,
                                 "min" : 0,
                                 "max" : 255,
                                 "last_division": "vert"}]

        add_subnet_ips(start_squares[0]);

        return start_squares[0];
    }
    else {
        var start_squares = halve(get_start_square(mask - 1))

        start_squares[0]["square"].classList.add("inactive");
        add_subnet_ips(start_squares[1]);
        return start_squares[1];
    }

}

function halve(rectangle_object) {
    var flip = {"hor": "vert",
                "vert": "hor"}

    var orientation = flip[rectangle_object["last_division"]]

    if (orientation === "hor") {
        half_1 = document.createElement('div');
        half_1.classList.add("halver_hor")
        half_1.style ="float: left; border-left: none;"

        half_2 = document.createElement('div');
        half_2.classList.add("halver_hor")
        half_2.style ="float: right;"

    }

    if (orientation === "vert") {
        half_1 = document.createElement('div');
        half_1.classList.add("halver_vert")
        half_1.style ="float: top; "

        half_2 = document.createElement('div');
        half_2.classList.add("halver_vert")
        half_2.style = "border-bottom: none;"    
    }

    rectangle_object["square"].appendChild(half_1);
    rectangle_object["square"].appendChild(half_2);
    
    var new_capacity = rectangle_object["capacity"] / 2;

    var half_1_min = rectangle_object["min"];
    var half_1_max = half_1_min + new_capacity - 1;

    var half_2_min = half_1_max + 1;
    var half_2_max = half_2_min + new_capacity - 1;

    return [{
            "square": half_1,
            "capacity": new_capacity,
            "min" : half_1_min,
            "max" : half_1_max,
            "last_division": orientation
            },
            {
            "square": half_2,
            "capacity": new_capacity,
            "min" : half_2_min,
            "max" : half_2_max,
            "last_division": orientation
           }];
}

function add_subnet(name, size) {

document.querySelector('input[name="sub_name"]').value = "";
document.querySelector('input[name="sub_size"]').value = "";

const table = document.getElementById("table");

let row = document.createElement("tr");
row.setAttribute("id", String(number_of_subnets))

let name_element = document.createElement("td");
name_element.classList.add("subnet_table_name");
name_element.innerText = name;

let hosts = document.createElement("td");
hosts.classList.add("subnet_table_hosts");
hosts.innerText = size;

let remove = document.createElement("td");
remove.classList.add("subnet_remove");
remove.addEventListener("click", function () {
    var subnet_id = parseInt(this.parentElement.getAttribute("id"))
    subnet_row = this.parentElement
    subnet_row.remove()
    subnets.splice(subnets.findIndex(item => item.order === subnet_id), 1);

    calculate();
})




row.appendChild(name_element);
row.appendChild(hosts);
row.appendChild(remove);

table.appendChild(row);

subnets.push({"name": name,
              "size": size,
              "order": number_of_subnets,
            })

number_of_subnets++
console.log(subnets)
calculate();

}

function create_table_header(text, parent){

table_header = document.createElement("th");
table_header.classList.add("subnet_header");
table_header.innerText = text;

parent.appendChild(table_header);

}

function create_table_cell(text, class_name, parent) {
    
table_cell = document.createElement("td");
table_cell.classList.add(class_name);
table_cell.innerHTML = text;

parent.appendChild(table_cell);

}

function write_subnets_and_masks(subnets) {

    subnets = subnets.sort((a, b) => (a.order > b.order) ? 1 : (a.order < b.order) ? -1 : 0);
    var ip = get_ip();
    //console.log(subnets);
    const results = document.getElementById("result");

    results.innerHTML = "";

    create_table_header("název", results);
    create_table_header("IP sítě", results);
    create_table_header("/ maska", results);
    create_table_header("maska", results);
    create_table_header("wildcard", results);
    create_table_header("1. platná IP", results);
    create_table_header("pos. platná IP", results);

    const alternating_background = {0 : "",
                                    1 : "#3badcc",
    }

    for (k in subnets) {
    
    var subnet_row = document.createElement("tr");
    subnet_row.classList.add("subnet_row")
    subnet_row.style = "background-color:" + alternating_background[k % 2] + "; font-weight: bold;"

    create_table_cell(subnets[k].name,
                      "subnet_table_name",
                      subnet_row);
    
    create_table_cell(ip[0] + "." + ip[1] + "." + ip[2] + "." + String(subnets[k].start_ip),
                      "subnet_table_address",
                      subnet_row);

    create_table_cell(" / "+subnets[k]["mask_/"],
                      "subnet_table_mask",
                      subnet_row);

    create_table_cell("255.255.255." + subnets[k]["mask"], 
                      "subnet_table_mask_full",
                      subnet_row);

    create_table_cell("0.0.0." + (255 - subnets[k]["mask"]),
                      "subnet_table_wildcard_mask",
                      subnet_row);
    
    create_table_cell("." + String(parseInt(subnets[k]["start_ip"] + 1)),
                      "subnet_table_first",
                      subnet_row);
                      
    create_table_cell("." + parseInt(subnets[k]["end_ip"] - 1),
                      "subnet_table_last",
                      subnet_row);
    
    var blank_row = document.createElement("tr");
    blank_row.classList.add("blank_row")

    //results.appendChild(blank_row);
    results.appendChild(subnet_row);
    }
}

function calculate() {
    if (subnets.length === 0) {
        start_square = get_start_square(get_mask())
        return
    }


subnets_and_sizes = []

    for (i in subnets) {
       // console.log(i, subnets[i]);
        var size = Math.pow(2, Math.ceil(Math.log((parseInt(subnets[i].size) + 2)) / Math.log(2)))
        subnets_and_sizes.push({"name": subnets[i].name,
                                "size": size,
                                "order": subnets[i]["order"]
                                });
       // console.log(i, subnets_and_sizes[i]);
}
    subnets_and_sizes = subnets_and_sizes.sort((a, b) => (a.size < b.size) ? 1 : (a.size > b.size) ? -1 : 0);

    if (start_square === null) {

        start_square = get_start_square(get_mask())
    }

    var subnets_sum = 0;
    
    for (j in subnets_and_sizes) {
        subnets_sum = subnets_sum + subnets_and_sizes[j]["size"];
    }

    if (subnets_sum > start_square["capacity"]) {
        document.getElementById("result").innerHTML = "<red_text style='font-size: 1.5rem;'>subsítě se do počáteční sítě nevejdou</red_text>";
        return
    }



results = generate_square(subnets_and_sizes, start_square);

write_subnets_and_masks(results)

}

function add_subnet_name(rectangle, name) {
    name_of_subnet = document.createElement("div");
    name_of_subnet.classList.add("subnet_name")
    name_of_subnet.innerText = name;

    rectangle["square"].appendChild(name_of_subnet);
}

function add_subnet_ips(rectangle) {
    start_ip = document.createElement('div');
    start_ip.classList.add("start_ip");
    start_ip.innerText = rectangle["min"];
    rectangle["square"].appendChild(start_ip);

    end_ip = document.createElement('div');
    end_ip.classList.add("end_ip");
    end_ip.innerText = rectangle["max"];
    rectangle["square"].appendChild(end_ip);
}

function generate_square(subnets_and_sizes, start_square) {

    final_subnets = [];

    let rectangles = [start_square]
    
    //console.log(rectangles[0])

    rectangles[0]["square"].innerHTML = "";

    while (subnets_and_sizes.length != 0) {
        if ((subnets_and_sizes[0].size) === rectangles[0]["capacity"]){
            
            add_subnet_name(rectangles[0], subnets_and_sizes[0].name);
            add_subnet_ips(rectangles[0]);
            final_subnets.push({"name": subnets_and_sizes[0].name,
                                "start_ip": rectangles[0]["min"],
                                "end_ip": rectangles[0]["max"],
                                "mask": size_to_masks[rectangles[0]["capacity"]][1],
                                "mask_/": size_to_masks[rectangles[0]["capacity"]][0],
                                "order": subnets_and_sizes[0]["order"]
                                });
            //console.log(rectangles[0])

            subnets_and_sizes.shift();
            rectangles.shift();

    }  else if ((subnets_and_sizes[0].size) < rectangles[0]["capacity"]){
            //console.log(rectangles[0].square, rectangles)
            halves = halve(rectangles[0]);
            rectangles.shift();
            rectangles.push(halves[0]);
            rectangles.push(halves[1]);

    }   else { return  }
    }
    return final_subnets;
}