import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConsumptionService } from '../services/consumption.service';
import { ToastComponent } from '../shared/toast/toast.component';
import { Consumption } from '../shared/models/consumption.model';

import * as d3 from 'd3';

@Component({
  selector: 'app-consumptions',
  templateUrl: './consumptions.component.html',
  styleUrls: ['./consumptions.component.css']
})
export class ConsumptionsComponent implements OnInit {

  consumption = new Consumption();
  consumptions: Consumption[] = [];
  isLoading = true;
  isEditing = false;
  settings = {
      bigBanner: true,
      timePicker: true,
      format: 'dd-MMM-yyyy hh:mm a',
      defaultOpen: false
  }
  addConsumptionForm: FormGroup;
  name = new FormControl('', Validators.required);
  type = new FormControl('', Validators.required);
  category = new FormControl('', Validators.required);
  value = new FormControl('', Validators.required);
  source = new FormControl('', Validators.required);
  remark = new FormControl('');
  date = new FormControl(new Date(), Validators.required);
  constructor(private consumptionService: ConsumptionService,
    private formBuilder: FormBuilder,
    public toast: ToastComponent) { }

  ngOnInit() {
    this.getConsumptions();
    this.addConsumptionForm = this.formBuilder.group({
      name: this.name,
      type: this.type,
      category: this.category,
      value: this.value,
      source: this.source,
      remark: this.remark,
      date: this.date
    });
    this.showline();

  }

  getConsumptions() {
    this.consumptionService.getConsumptions().subscribe(
      data => this.consumptions = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  addConsumption() {
    this.consumptionService.addConsumption(this.addConsumptionForm.value).subscribe(
      res => {
        this.consumptions.push(res);
        this.addConsumptionForm.reset();
        this.toast.setMessage('item added successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  enableEditing(consumption: Consumption) {
    this.isEditing = true;
    this.consumption = consumption;
  }

  cancelEditing() {
    this.isEditing = false;
    this.consumption = new Consumption();
    this.toast.setMessage('item editing cancelled.', 'warning');
    // reload the cats to reset the editing
    this.getConsumptions();
  }

  editConsumption(consumption: Consumption) {
    this.consumptionService.editConsumption(consumption).subscribe(
      () => {
        this.isEditing = false;
        this.consumption = consumption;
        this.toast.setMessage('item edited successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  deleteConsumption(consumption: Consumption) {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      this.consumptionService.deleteConsumption(consumption).subscribe(
        () => {
          const pos = this.consumptions.map(elem => elem._id).indexOf(consumption._id);
          this.consumptions.splice(pos, 1);
          this.toast.setMessage('item deleted successfully.', 'success');
        },
        error => console.log(error)
      );
    }
  }
  showline(): void {

    let width = 700, height = 400, margin = { left: 35, top: 20, right: 20, bottom: 20 },
      g_width = width - margin.left - margin.right, g_height = height - margin.top - margin.bottom;

    let colors = [d3.rgb(0, 0, 255), d3.rgb(255, 0, 0)];
    let data = [{ a1: [[0, 3], [1, 1], [2, 3], [3, 5], [4, 9], [5, 4], [6, 2], [7, 3], [8, 6], [9, 8], [10, 10], [11, 5], [12, 3],] },
    { a1: [[0, 4], [1, 3], [2, 8], [3, 5], [4, 5], [5, 10], [6, 7], [7, 5], [8, 1], [9, 2], [10, 8], [11, 11], [12, 7],] },];

    let gdpmax = 0;
    for (let i = 0; i < data.length; i++) {
      var currGdp = d3.max(data[i].a1, function (d) { return d[1]; });
      if (currGdp > gdpmax) gdpmax = currGdp;
    }
    //gdpmax = gdpmax + 1;

    let scale_x = d3.scaleLinear()
      .domain([0, data[0].a1.length - 1])
      .range([0, g_width]);

    let scale_y = d3.scaleLinear()
      .domain([0, gdpmax])  //domain([0, gdpmax * 1.1])   domain([0, gdpmax])
      .range([g_height, 0]);

    let line_generator = d3.line()
      .x(function (d) { return scale_x(d[0]); })
      .y(function (d) { return scale_y(d[1]); })
    //.curve(d3.curveBasis);

    let svg = d3.select("#container")
      .append("svg:svg")
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("d", function (d) { return line_generator(d.a1); })
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("stroke", function (d, i) { return colors[i]; });

    /*
    svg.selectAll("circle")
    .data(data[0].a1)
    .enter()
    .append("circle")
    .attr("transform","translate("+margin.left+","+margin.top+")")
    .attr("cx", function(d,i) {return scale_x(d[0]); })
    .attr("cy", function(d,i) {return scale_y(d[1]); })
    .attr("r",5)
    .attr("fill","#09F")
    .attr("stroke",function(d,i){ return colors[0];});
    */

    let index: number = 1;
    svg.selectAll("circle")
      .data(data[index].a1)
      .enter()
      .append("circle")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("cx", function (d, i) { return scale_x(d[0]); })
      .attr("cy", function (d, i) { return scale_y(d[1]); })
      .attr("r", 5)
      .attr("fill", function (d, i) { return colors[index]; })
      .attr("stroke", function (d, i) { return colors[index]; });

    //=================================
    let x_axis = d3.axisBottom(scale_x), y_axis = d3.axisLeft(scale_y);
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + (height - margin.top) + ")")
      .call(x_axis);

    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(y_axis);

    //=======================================

    //定义横轴网格线
    let xInner = d3.axisBottom(scale_x)
      .tickSize(g_height, 0, 0)
      .tickFormat("")
      .ticks(data[0].a1.length);

    //添加横轴网格线
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "inner_line")
      //.attr("stroke","red")
      .call(xInner);

    //=========================================

    //定义纵轴网格线
    let yInner = d3.axisLeft(scale_y)
      .tickSize(-g_width, 0, 0)
      .tickFormat("")
      .ticks(gdpmax);

    //添加纵轴网格线
    svg.append("g")
      .attr("class", "inner_line")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(yInner);

    //==========================================
  }
}
