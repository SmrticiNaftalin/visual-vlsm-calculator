number_of_subnets = 0
subnets = []


//add_subnet("A", 120);
//add_subnet("B", 60);
//add_subnet("C", 20);
//add_subnet("D", 14);
//add_subnet("E", 6);
//add_subnet("F", 2);
//add_subnet("G", 2);

function save_network() {

    ip = document.getElementById("network_input").value;
    document.getElementById("saved_network").innerText = ip
    
    mask = parseInt(ip.split("/")[1])
    if ((mask >= 24) && (mask <=30)) {
        console.log(mask);
        setup_square(mask);
    }
}

function setup_square(mask) {
    if (mask === 24) {
        return;
    }
    if (mask === 25) {
        // TODO
        return;
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

        rectangle_object["square"].appendChild(half_1);
        rectangle_object["square"].appendChild(half_2);
    }

    if (orientation === "vert") {
        half_1 = document.createElement('div');
        half_1.classList.add("halver_vert")
        half_1.style ="float: top; "

        half_2 = document.createElement('div');
        half_2.classList.add("halver_vert")
        half_2.style = "border-bottom: none;"


        rectangle_object["square"].appendChild(half_1);
        rectangle_object["square"].appendChild(half_2);
        
    }
    
    var new_capacity = rectangle_object["capacity"] / 2;

    var half_1_min = rectangle_object["min"];
    var half_1_max = half_1_min + new_capacity - 1;

    var half_2_min = half_1_max + 1;
    var half_2_max = half_2_min + new_capacity - 1;

    return [{"square": half_1,
             "capacity": new_capacity,
             "min" : half_1_min,
             "max" : half_1_max,
             "last_division": orientation
            },
            {"square": half_2,
            "capacity": new_capacity,
            "min" : half_2_min,
            "max" : half_2_max,
            "last_division": orientation
           }]

}

function add_subnet(name, size) {

document.querySelector('input[name="sub_name"]').value = "";
document.querySelector('input[name="sub_size"]').value = "";

const table = document.getElementById("table");

let row = document.createElement("tr");

let name_element = document.createElement("td");
name_element.classList.add("subnet_table_name");
name_element.innerText = name;

let hosts = document.createElement("td");
hosts.classList.add("subnet_table_hosts");
hosts.innerText = size;

table.appendChild(row);
row.appendChild(name_element);
row.appendChild(hosts);

subnets.push({"name": name,
              "size": size,
              "order": number_of_subnets,
            })

number_of_subnets++

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

    console.log(subnets);
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
    
    subnet_row = document.createElement("tr");
    subnet_row.classList.add("subnet_row")
    subnet_row.style = "background-color:" + alternating_background[subnets[k]["order"] % 2] + "; font-weight: bold;"

    create_table_cell(subnets[k].name, "subnet_table_name", subnet_row);

    ip_without_last_byte = ip.split("/")[0].split(".");
    ip_without_last_byte.pop();
    ip_without_last_byte = ip_without_last_byte.join(".") + ".";
    ip_without_last_byte = "<ip>"+ip_without_last_byte+"</ip>";
    
    create_table_cell(ip_without_last_byte + String(subnets[k].start_ip), "subnet_table_address", subnet_row);
    create_table_cell(" / "+subnets[k]["mask_/"], "subnet_table_mask", subnet_row);
    create_table_cell("255.255.255." + subnets[k]["mask"], "subnet_table_mask_full", subnet_row);
    create_table_cell("0.0.0." + (255 - subnets[k]["mask"]), "subnet_table_wildcard_mask", subnet_row);
    
    //create_table_cell(ip_without_last_byte + String(parseInt(subnets[k]["start_ip"] + 1)), "subnet_table_first", subnet_row);
    create_table_cell("." + String(parseInt(subnets[k]["start_ip"] + 1)), "subnet_table_first", subnet_row);
    create_table_cell("." + parseInt(subnets[k]["end_ip"] - 1), "subnet_table_last", subnet_row);
    
    blank_row = document.createElement("tr");
    blank_row.classList.add("blank_row")

    //results.appendChild(blank_row);
    results.appendChild(subnet_row);
    }
}

function calculate() {
subnets_and_sizes = []
const square = document.getElementById("vlsm_square");
    for (i in subnets) {
        size = Math.pow(2,Math.ceil(Math.log((parseInt(subnets[i].size) + 2))/Math.log(2)))
        subnets_and_sizes.push({"name": subnets[i].name,
                                "size": size,
                                "order": subnets[i]["order"]
                                });
}
    subnets_and_sizes = subnets_and_sizes.sort((a, b) => (a.size < b.size) ? 1 : (a.size > b.size) ? -1 : 0);
console.log(subnets_and_sizes);
results = generate_square(subnets_and_sizes);

write_subnets_and_masks(results)

}

function add_subnet_name_and_ips(rectangle, name) {
    name_of_subnet = document.createElement("div");
    name_of_subnet.classList.add("subnet_name")
    name_of_subnet.innerText = name;

    rectangle["square"].appendChild(name_of_subnet);

    start_ip = document.createElement('div');
    start_ip.classList.add("start_ip");
    start_ip.innerText = rectangle["min"];
    rectangle["square"].appendChild(start_ip);

    end_ip = document.createElement('div');
    end_ip.classList.add("end_ip");
    end_ip.innerText = rectangle["max"];
    rectangle["square"].appendChild(end_ip);

}

function generate_square(subnets_and_sizes) {

    final_subnets = [];

    const size_to_masks = { 256:   ["24", 0],
                            128:   ["25", 128],
                            64:    ["26", 192],
                            32:    ["27", 224],
                            16:    ["28", 240],
                            8:     ["29", 248],
                            4:     ["30", 252],
                        }


    let rectangles = [{ "square": document.getElementById("vlsm_square"),
                        "capacity": 256,
                        "min" : 0,
                        "max" : 255,
                        "last_division": "vert"}]

    rectangles[0]["square"].innerHTML = "";

    while (subnets_and_sizes.length != 0) {
        if ((subnets_and_sizes[0].size) === rectangles[0]["capacity"]){
            
            add_subnet_name_and_ips(rectangles[0], subnets_and_sizes[0].name);
            
            final_subnets.push({"name": subnets_and_sizes[0].name,
                                "start_ip": rectangles[0]["min"],
                                "end_ip": rectangles[0]["max"],
                                "mask": size_to_masks[rectangles[0]["capacity"]][1],
                                "mask_/": size_to_masks[rectangles[0]["capacity"]][0],
                                "order": subnets_and_sizes[0]["order"]
                                });
            console.log(rectangles[0])

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

